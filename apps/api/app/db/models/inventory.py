import uuid
from datetime import datetime, timezone, date
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Numeric, Date, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    item_code: Mapped[str] = mapped_column(String(100), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    item_class: Mapped[str] = mapped_column(String(100), nullable=True)
    description: Mapped[str] = mapped_column(String, nullable=True)
    primary_uom: Mapped[str] = mapped_column(String(50), nullable=False)
    secondary_uom: Mapped[str] = mapped_column(String(50), nullable=True)
    secondary_uom_conversion: Mapped[float] = mapped_column(Numeric(15, 4), nullable=True)
    part_number: Mapped[str] = mapped_column(String(100), nullable=True)
    alternative_available: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("organization_id", "item_code", name="uq_organization_item_code"),
    )

class ItemBatch(Base):
    __tablename__ = "item_batches"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    lot_number: Mapped[str] = mapped_column(String(100), nullable=False)
    expiry_date: Mapped[date] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("organization_id", "item_id", "lot_number", name="uq_organization_item_lot"),
    )

class BranchInventory(Base):
    __tablename__ = "branch_inventory"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    branch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    batch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("item_batches.id", ondelete="CASCADE"), nullable=False)
    locator: Mapped[str] = mapped_column(String(100), nullable=True)
    primary_quantity: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    secondary_quantity: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=True)
    unit_price: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    inventory_value: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

class InventoryImport(Base):
    __tablename__ = "inventory_imports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    branch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="UPLOADED", nullable=False) # UPLOADED, VALIDATING, READY, IMPORTING, COMPLETED, FAILED
    total_rows: Mapped[int] = mapped_column(default=0, nullable=False)
    valid_rows: Mapped[int] = mapped_column(default=0, nullable=False)
    warning_rows: Mapped[int] = mapped_column(default=0, nullable=False)
    error_rows: Mapped[int] = mapped_column(default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
