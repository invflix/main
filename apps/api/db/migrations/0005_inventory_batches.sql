-- Migrations: 0005_inventory_batches.sql

-- Item Batches table
CREATE TABLE IF NOT EXISTS item_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_organization_item_lot UNIQUE (organization_id, item_id, lot_number)
);

CREATE INDEX IF NOT EXISTS idx_batches_expiry ON item_batches(expiry_date);

-- Branch Inventory table
CREATE TABLE IF NOT EXISTS branch_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES item_batches(id) ON DELETE CASCADE,
    locator VARCHAR(100),
    primary_quantity NUMERIC(15, 4) NOT NULL DEFAULT 0.0,
    secondary_quantity NUMERIC(15, 4) DEFAULT 0.0,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    inventory_value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branch_inv_org_id ON branch_inventory(organization_id);
CREATE INDEX IF NOT EXISTS idx_branch_inv_branch_id ON branch_inventory(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_inv_item_id ON branch_inventory(item_id);

-- Inventory Imports table
CREATE TABLE IF NOT EXISTS inventory_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'UPLOADED',
    total_rows INTEGER DEFAULT 0,
    valid_rows INTEGER DEFAULT 0,
    warning_rows INTEGER DEFAULT 0,
    error_rows INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
