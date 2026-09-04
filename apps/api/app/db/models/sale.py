import uuid
from datetime import datetime, timezone
from sqlalchemy import String, ForeignKey, Numeric, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Sale(Base):
    __tablename__ = "sales"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    branch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    sale_number: Mapped[str] = mapped_column(String(100), nullable=False)
    sold_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sale_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    total_revenue: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    total_cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    gross_profit: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("organization_id", "sale_number", name="uq_organization_sale"),
    )

class SaleItem(Base):
    __tablename__ = "sale_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    sale_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sales.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    batch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("item_batches.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(15, 4), default=0.0, nullable=False)
    unit_cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    selling_price: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
    profit: Mapped[float] = mapped_column(Numeric(15, 2), default=0.00, nullable=False)
