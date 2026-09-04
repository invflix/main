-- Migrations: 0004_inventory_items.sql

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_code VARCHAR(100) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_class VARCHAR(100),
    description TEXT,
    primary_uom VARCHAR(50) NOT NULL,
    secondary_uom VARCHAR(50),
    secondary_uom_conversion NUMERIC(15, 4),
    part_number VARCHAR(100),
    alternative_available BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_organization_item_code UNIQUE (organization_id, item_code)
);

CREATE INDEX IF NOT EXISTS idx_items_org_id ON items(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_code ON items(item_code);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
