import os
import uuid
import pandas as pd
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.permissions import get_current_user, require_manager
from app.db.models.user import User
from app.db.models.inventory import InventoryImport
from app.modules.imports.schemas import UploadResponse, MapColumnsRequest, MapColumnsResponse, ImportStatusResponse
from app.core.exceptions import APIException
from app.celery.tasks.inventory_import import import_inventory_excel
from app.core.logging import logger

router = APIRouter()

UPLOAD_DIR = "/workspace/scratch/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{organization_id}/inventory/imports/upload", response_model=UploadResponse)
async def upload_import_file(
    organization_id: uuid.UUID,
    branch_id: uuid.UUID = Query(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=True))
):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise APIException(code="INVALID_FILE_TYPE", message="Only Excel files (.xlsx, .xls) are allowed.", status_code=400)
        
    import_id = uuid.uuid4()
    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{import_id}{file_extension}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    # Save the file
    with open(saved_path, "wb") as f:
        f.write(await file.read())
        
    try:
        # Load headers and row preview using pandas
        df = pd.read_excel(saved_path, nrows=10)
        total_df = pd.read_excel(saved_path)
        total_rows = len(total_df)
        
        headers = [str(col) for col in df.columns]
        # Replace NaN with None
        df_clean = df.where(pd.notnull(df), None)
        preview_rows = df_clean.to_dict(orient="records")
        
        # Save record in db
        db_import = InventoryImport(
            id=import_id,
            organization_id=organization_id,
            branch_id=branch_id,
            uploaded_by=current_user.id,
            file_name=file.filename,
            status="UPLOADED",
            total_rows=total_rows
        )
        db.add(db_import)
        await db.commit()
        
        return UploadResponse(
            import_id=import_id,
            file_name=file.filename,
            headers=headers,
            preview_rows=preview_rows,
            total_rows=total_rows
        )
        
    except Exception as e:
        logger.error(f"Excel file parsing failed: {e}")
        if os.path.exists(saved_path):
            os.remove(saved_path)
        raise APIException(code="PARSING_FAILED", message=f"Failed to parse Excel file: {str(e)}", status_code=400)

@router.post("/{organization_id}/inventory/imports/{import_id}/map", response_model=MapColumnsResponse)
async def map_columns_and_validate(
    organization_id: uuid.UUID,
    import_id: uuid.UUID,
    data: MapColumnsRequest,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=False))
):
    # Find import
    stmt = select(InventoryImport).where(InventoryImport.id == import_id, InventoryImport.organization_id == organization_id)
    res = await db.execute(stmt)
    db_import = res.scalar_one_or_none()
    if not db_import:
        raise APIException(code="IMPORT_NOT_FOUND", message="Import job not found.", status_code=404)
        
    # Find the saved file
    extensions = [".xlsx", ".xls"]
    saved_path = None
    for ext in extensions:
        p = os.path.join(UPLOAD_DIR, f"{import_id}{ext}")
        if os.path.exists(p):
            saved_path = p
            break
            
    if not saved_path:
        raise APIException(code="FILE_NOT_FOUND", message="Uploaded spreadsheet file was not found on disk.", status_code=404)
        
    try:
        # Perform validation on all rows
        df = pd.read_excel(saved_path)
        df = df.where(pd.notnull(df), None)
        
        mapping = data.mapping
        errors = []
        valid_rows = 0
        warning_rows = 0
        error_rows = 0
        
        # Required fields in items master: item_code, item_name, primary_uom
        required_fields = ["item_code", "item_name", "primary_uom"]
        
        for idx, row in df.iterrows():
            row_num = idx + 1
            row_errors = []
            
            # Extract mapped values
            row_data = {}
            for target_field, excel_col in mapping.items():
                if excel_col in row:
                    row_data[target_field] = row[excel_col]
                    
            # Check required
            for rf in required_fields:
                val = row_data.get(rf)
                if val is None or str(val).strip() == "":
                    row_errors.append(f"Missing required field: '{rf}'")
                    
            if row_errors:
                error_rows += 1
                errors.append({"row": row_num, "errors": row_errors})
            else:
                valid_rows += 1
                
        db_import.status = "READY"
        db_import.valid_rows = valid_rows
        db_import.warning_rows = warning_rows
        db_import.error_rows = error_rows
        await db.commit()
        
        return MapColumnsResponse(
            import_id=import_id,
            status="READY",
            total_rows=len(df),
            valid_rows=valid_rows,
            warning_rows=warning_rows,
            error_rows=error_rows,
            errors=errors
        )
        
    except Exception as e:
        logger.error(f"Mapping/validation error: {e}")
        raise APIException(code="VALIDATION_FAILED", message=f"Failed validation check: {str(e)}", status_code=400)

@router.post("/{organization_id}/inventory/imports/{import_id}/confirm", response_model=ImportStatusResponse)
async def confirm_import(
    organization_id: uuid.UUID,
    import_id: uuid.UUID,
    data: MapColumnsRequest,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=False))
):
    stmt = select(InventoryImport).where(InventoryImport.id == import_id, InventoryImport.organization_id == organization_id)
    res = await db.execute(stmt)
    db_import = res.scalar_one_or_none()
    if not db_import:
        raise APIException(code="IMPORT_NOT_FOUND", message="Import job not found.", status_code=404)
        
    if db_import.status != "READY":
        raise APIException(code="INVALID_STATUS", message=f"Import must be in READY status (current status: {db_import.status}).", status_code=400)
        
    db_import.status = "IMPORTING"
    await db.commit()
    
    # Trigger celery task asynchronously
    import_inventory_excel.delay(str(import_id), data.mapping)
    
    return db_import

@router.get("/{organization_id}/inventory/imports/{import_id}", response_model=ImportStatusResponse)
async def get_import_status(
    organization_id: uuid.UUID,
    import_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _ = Depends(require_manager(check_branch=False))
):
    stmt = select(InventoryImport).where(InventoryImport.id == import_id, InventoryImport.organization_id == organization_id)
    res = await db.execute(stmt)
    db_import = res.scalar_one_or_none()
    if not db_import:
        raise APIException(code="IMPORT_NOT_FOUND", message="Import job not found.", status_code=404)
    return db_import
