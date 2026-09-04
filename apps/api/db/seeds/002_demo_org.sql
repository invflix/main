-- Seeds: 002_demo_org.sql
-- Create Medicare Pharmacy Group organization and its branches/members.
-- All passwords are 'password123'

-- Organization
INSERT INTO organizations (id, name, business_email, phone)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'MediCare Pharmacy Group',
    'contact@medicare.com',
    '+91 11 2345 6789'
)
ON CONFLICT DO NOTHING;

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
    'owner@medistock.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Amit Sharma (Owner)',
    FALSE,
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000002',
    'manager@medistock.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Rahul Verma (Manager)',
    FALSE,
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000003',
    'pharmacist@medistock.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Dr. Priya Nair (Pharmacist)',
    FALSE,
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000004',
    'staff@medistock.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Vikram Singh (Staff)',
    FALSE,
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000005',
    'cashier@medistock.com',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Neha Gupta (Cashier)',
    FALSE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

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
    'd0000000-0000-0000-0000-000000000003',
    'PHARMACIST',
    'ACTIVE'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000004',
    'STAFF',
    'ACTIVE'
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000005',
    'CASHIER',
    'ACTIVE'
)
ON CONFLICT (organization_id, user_id) DO NOTHING;

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
-- Pharmacist assigned to Delhi
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000003'
),
-- Staff assigned to Noida
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000004'
),
-- Cashier assigned to Gurgaon
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000005'
)
ON CONFLICT (branch_id, user_id) DO NOTHING;
