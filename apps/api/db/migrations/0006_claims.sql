-- Migrations: 0006_claims.sql

-- Insurance Claims table
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    claim_number VARCHAR(100) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    insurance_provider VARCHAR(255) NOT NULL,
    claim_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_organization_claim UNIQUE (organization_id, claim_number)
);

CREATE INDEX IF NOT EXISTS idx_claims_org_id ON insurance_claims(organization_id);
CREATE INDEX IF NOT EXISTS idx_claims_branch_id ON insurance_claims(branch_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON insurance_claims(status);

-- Claim Status History table
CREATE TABLE IF NOT EXISTS claim_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES insurance_claims(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_hist_claim_id ON claim_status_history(claim_id);
