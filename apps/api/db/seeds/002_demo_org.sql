-- Seeds: 002_demo_org.sql
-- Create Invflix demo organization and its branches/members.
-- All passwords are 'password123'

-- Organization
INSERT INTO organizations (id, name, business_email, phone)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Invflix Pharmacy Group',
    'hashim@invflix.com',
    '+91 11 2345 6789'
)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    business_email = EXCLUDED.business_email,
    phone = EXCLUDED.phone;

-- Branches
INSERT INTO branches (id, organization_id, name, branch_code, address, city, state, postal_code, phone, is_active)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Delhi - Connaught Place',
    'DEL01',
    'E-Block, Connaught Place',
    'New Delhi',
    'Delhi',
    '110001',
    '+91 11 9876 5432',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'Noida - Sector 18',
    'NOI01',
    'P-Block, Sector 18',
    'Noida',
    'Uttar Pradesh',
    '201301',
    '+91 120 9876 543',
    TRUE
),
(
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'Gurgaon - Sector 44',
    'GUR01',
    'Institutional Area, Sector 44',
    'Gurgaon',
    'Haryana',
    '122003',
    '+91 124 9876 543',
    TRUE
)
ON CONFLICT (organization_id, branch_code) DO NOTHING;

-- Users
INSERT INTO users (id, email, password_hash, full_name, is_platform_admin, is_active)
VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'hashim@invflix.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Hashim Khan',
    FALSE,
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000002',
    'shahrukh@invflix.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Shahrukh Khan',
    FALSE,
    TRUE
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    is_platform_admin = EXCLUDED.is_platform_admin,
    is_active = TRUE;

-- Organization Memberships
INSERT INTO organization_members (id, organization_id, user_id, role, status)
VALUES
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'OWNER',
    'ACTIVE'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'MANAGER',
    'ACTIVE'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'OWNER',
    'ACTIVE'
)
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = EXCLUDED.role,
    status = 'ACTIVE';

-- Branch Memberships
INSERT INTO branch_members (id, organization_id, branch_id, user_id)
VALUES
-- Owner has implicit access to all, but let's record it or map managers specifically
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000001'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001'
),
-- Manager assigned to Delhi and Noida
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002'
),
-- Abhyudaya assigned to all branches
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (branch_id, user_id) DO NOTHING;
