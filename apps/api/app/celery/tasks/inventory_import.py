import os
import asyncio
import uuid
import pandas as pd
from datetime import datetime, date, timezone
from celery import shared_task
from app.celery.app import celery_app
from app.db.session import async_session_maker
import app.db.models  # noqa: F401 - register all SQLAlchemy tables for FK resolution
from app.db.models.inventory import InventoryImport, Item, ItemBatch, BranchInventory
from app.db.models.audit import AuditLog
from app.core.logging import logger
from sqlalchemy import select

def parse_date(val) -> date | None:
    if pd.isnull(val) or not val:
        return None
    try:
        if isinstance(val, (datetime, date)):
            return val
        return pd.to_datetime(val).date()
    except Exception:
        return None

async def process_excel_import(import_job_id: str, mapping: dict):
    logger.info(f"Starting async excel import processing for job={import_job_id}")
    
    async with async_session_maker() as session:
        # Load import details
        job_uuid = uuid.UUID(import_job_id)
        stmt = select(InventoryImport).where(InventoryImport.id == job_uuid)
        res = await session.execute(stmt)
        db_import = res.scalar_one_or_none()
        
        if not db_import:
            logger.error(f"Import job {import_job_id} not found in database.")
            return
            
        extensions = [".xlsx", ".xls"]
        saved_path = None
        for ext in extensions:
            p = f"/workspace/scratch/uploads/{import_job_id}{ext}"
            if os.path.exists(p):
                saved_path = p
                break
                
        if not saved_path:
            logger.error(f"Spreadsheet file for job {import_job_id} not found on disk.")
            db_import.status = "FAILED"
            await session.commit()
            return
            
        try:
            df = pd.read_excel(saved_path)
            df = df.where(pd.notnull(df), None)
            
            for idx, row in df.iterrows():
                # Extract mapped values
                row_data = {}
                for target_field, excel_col in mapping.items():
                    if excel_col in row:
                        row_data[target_field] = row[excel_col]
                
                # Validation checks
                item_code = row_data.get("item_code")
                item_name = row_data.get("item_name")
                primary_uom = row_data.get("primary_uom")
                
                if not item_code or not item_name or not primary_uom:
                    continue  # Skip invalid rows
                    
                # 1. Upsert Item
                item_stmt = select(Item).where(
                    Item.organization_id == db_import.organization_id,
                    Item.item_code == str(item_code)
                )
                item_res = await session.execute(item_stmt)
                item = item_res.scalar_one_or_none()
                
                if not item:
                    item = Item(
                        organization_id=db_import.organization_id,
                        item_code=str(item_code),
                        item_name=str(item_name),
                        item_class=str(row_data.get("item_class")) if row_data.get("item_class") else None,
                        description=str(row_data.get("description")) if row_data.get("description") else None,
                        primary_uom=str(primary_uom),
                        secondary_uom=str(row_data.get("secondary_uom")) if row_data.get("secondary_uom") else None,
                        secondary_uom_conversion=float(row_data.get("secondary_uom_conversion")) if row_data.get("secondary_uom_conversion") else None,
                        part_number=str(row_data.get("part_number")) if row_data.get("part_number") else None,
                        alternative_available=bool(row_data.get("alternative_available")) if row_data.get("alternative_available") else False
                    )
                    session.add(item)
                    await session.flush()
                else:
                    # Update fields
                    item.item_name = str(item_name)
                    item.primary_uom = str(primary_uom)
                    if row_data.get("item_class"): item.item_class = str(row_data["item_class"])
                    if row_data.get("description"): item.description = str(row_data["description"])
                    if row_data.get("secondary_uom"): item.secondary_uom = str(row_data["secondary_uom"])
                    if row_data.get("secondary_uom_conversion"): item.secondary_uom_conversion = float(row_data["secondary_uom_conversion"])
                    if row_data.get("part_number"): item.part_number = str(row_data["part_number"])
                    if row_data.get("alternative_available") is not None: item.alternative_available = bool(row_data["alternative_available"])
                    await session.flush()

                # 2. Upsert Batch
                lot_number = str(row_data.get("lot_number")) if row_data.get("lot_number") else "LOT-UNKNOWN"
                expiry_dt = parse_date(row_data.get("expiry_date"))
                
                batch_stmt = select(ItemBatch).where(
                    ItemBatch.organization_id == db_import.organization_id,
                    ItemBatch.item_id == item.id,
                    ItemBatch.lot_number == lot_number
                )
                batch_res = await session.execute(batch_stmt)
                batch = batch_res.scalar_one_or_none()
                
                if not batch:
                    batch = ItemBatch(
                        organization_id=db_import.organization_id,
                        item_id=item.id,
                        lot_number=lot_number,
                        expiry_date=expiry_dt
                    )
                    session.add(batch)
                    await session.flush()
                else:
                    if expiry_dt:
                        batch.expiry_date = expiry_dt
                        await session.flush()

                # 3. Upsert Branch Inventory
                locator = str(row_data.get("locator")) if row_data.get("locator") else "DEFAULT"
                primary_qty = float(row_data.get("primary_quantity")) if row_data.get("primary_quantity") is not None else 0.0
                secondary_qty = float(row_data.get("secondary_quantity")) if row_data.get("secondary_quantity") is not None else None
                unit_price = float(row_data.get("unit_price")) if row_data.get("unit_price") is not None else 0.00
                inventory_value = float(row_data.get("inventory_value")) if row_data.get("inventory_value") is not None else (primary_qty * unit_price)

                inv_stmt = select(BranchInventory).where(
                    BranchInventory.branch_id == db_import.branch_id,
                    BranchInventory.item_id == item.id,
                    BranchInventory.batch_id == batch.id,
                    BranchInventory.locator == locator
                )
                inv_res = await session.execute(inv_stmt)
                inv = inv_res.scalar_one_or_none()
                
                if not inv:
                    inv = BranchInventory(
                        organization_id=db_import.organization_id,
                        branch_id=db_import.branch_id,
                        item_id=item.id,
                        batch_id=batch.id,
                        locator=locator,
                        primary_quantity=primary_qty,
                        secondary_quantity=secondary_qty,
                        unit_price=unit_price,
                        inventory_value=inventory_value
                    )
                    session.add(inv)
                else:
                    inv.primary_quantity = primary_qty
                    inv.secondary_quantity = secondary_qty
                    inv.unit_price = unit_price
                    inv.inventory_value = inventory_value
                await session.flush()

            # Mark import completed
            db_import.status = "COMPLETED"
            db_import.completed_at = datetime.now(timezone.utc)
            
            # Audit log
            audit = AuditLog(
                actor_user_id=db_import.uploaded_by,
                organization_id=db_import.organization_id,
                branch_id=db_import.branch_id,
                action="INVENTORY_IMPORTED",
                entity_type="inventory_import",
                entity_id=db_import.id,
                payload={"total_rows": db_import.total_rows, "file_name": db_import.file_name}
            )
            session.add(audit)
            await session.commit()
            
            # Clean up temp file
            if os.path.exists(saved_path):
                os.remove(saved_path)
            logger.info(f"Inventory import job={import_job_id} completed successfully.")
            
        except Exception as e:
            logger.error(f"Error processing import job {import_job_id}: {e}")
            await session.rollback()
            failed_res = await session.execute(select(InventoryImport).where(InventoryImport.id == job_uuid))
            failed_import = failed_res.scalar_one_or_none()
            if failed_import:
                failed_import.status = "FAILED"
                failed_import.completed_at = datetime.now(timezone.utc)
                await session.commit()

@celery_app.task(name="import_inventory_excel")
def import_inventory_excel(import_job_id: str, column_mapping: dict):
    # Execute async task in synchronous context
    asyncio.run(process_excel_import(import_job_id, column_mapping))
    return {"status": "success", "import_job_id": import_job_id}
