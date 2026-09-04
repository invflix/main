-- Seeds: 003_demo_inventory.sql
-- Seed sample items, batches, inventory, claims, sales, and audit logs.

-- Items
INSERT INTO items (id, organization_id, item_code, item_name, item_class, description, primary_uom, secondary_uom, secondary_uom_conversion, part_number, alternative_available)
VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'ITEM001',
    'Dolo 650',
    'Analgesics',
    'Paracetamol 650mg tablets for pain and fever relief',
    'Box',
    'Strip',
    10.0,
    'DOLO-650-BX',
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'ITEM002',
    'Augmentin 625',
    'Antibiotics',
    'Amoxicillin and Clavulanate Potassium Tablets IP 625mg',
    'Box',
    'Tablet',
    10.0,
    'AUG-625',
    FALSE
),
(
    'e0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'ITEM003',
    'Azithromycin 500mg',
    'Antibiotics',
    'Azithromycin broad-spectrum antibiotic tablets',
    'Pack',
    'Tablet',
    3.0,
    'AZITH-500',
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'ITEM004',
    'Paracetamol 500mg',
    'Analgesics',
    'Standard fever reducer and pain reliever',
    'Box',
    'Strip',
    15.0,
    'PARA-500',
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    'ITEM005',
    'Cetirizine 10mg',
    'Antihistamines',
    'Antiallergic tablet for relief from runny nose and watery eyes',
    'Box',
    'Strip',
    10.0,
    'CET-10',
    TRUE
)
ON CONFLICT (organization_id, item_code) DO NOTHING;

-- Item Batches (expiry date formats are YYYY-MM-DD)
-- Let's define current date reference: 2026-08-12
INSERT INTO item_batches (id, organization_id, item_id, lot_number, expiry_date)
VALUES
-- Healthy expiry
(
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'LOT-DOLO-001',
    '2028-06-30'
),
-- Expiring <30 days (Current date is Aug 12, so expiry around Aug 25 to Sep 5 is < 30 days)
(
    'f0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'LOT-DOLO-002',
    '2026-08-28'
),
-- Expired
(
    'f0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'LOT-AUG-E01',
    '2026-05-15'
),
-- Expiring 30-60 days (Expiry in mid-September to early October)
(
    'f0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000003',
    'LOT-AZI-EXP2',
    '2026-09-25'
),
-- Expiring 60-90 days (Expiry in mid-October to early November)
(
    'f0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000004',
    'LOT-PARA-EXP3',
    '2026-10-20'
),
-- Healthy expiry for Cetirizine
(
    'f0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000005',
    'LOT-CET-001',
    '2027-12-31'
)
ON CONFLICT (organization_id, item_id, lot_number) DO NOTHING;

-- Branch Inventory (Delhi, Noida, Gurgaon)
INSERT INTO branch_inventory (id, organization_id, branch_id, item_id, batch_id, locator, primary_quantity, secondary_quantity, unit_price, inventory_value)
VALUES
-- Delhi Branch Items
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    'Shelf-A1',
    150.0,
    1500.0,
    120.00,
    18000.00
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000002',
    'Shelf-A2',
    20.0,
    200.0,
    115.00,
    2300.00
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000002',
    'f0000000-0000-0000-0000-000000000003',
    'Cold-Storage-1',
    45.0,
    450.0,
    450.00,
    20250.00
),
-- Noida Branch Items
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000004',
    'Rack-B1',
    80.0,
    240.0,
    95.00,
    7600.00
),
-- Gurgaon Branch Items
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000005',
    'Shelf-C1',
    300.0,
    4500.0,
    50.00,
    15000.00
),
(
    gen_random_uuid(),
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000005',
    'f0000000-0000-0000-0000-000000000006',
    'Shelf-C2',
    120.0,
    1200.0,
    30.00,
    3600.00
)
ON CONFLICT DO NOTHING;

-- Claims
INSERT INTO insurance_claims (id, organization_id, branch_id, claim_number, patient_name, insurance_provider, claim_amount, status, assigned_to, submitted_at)
VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'CLM-2026-001',
    'Aarav Kumar',
    'Star Health Insurance',
    3500.00,
    'APPROVED',
    'd0000000-0000-0000-0000-000000000003',
    '2026-08-01 10:00:00+00'
),
(
    '10000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'CLM-2026-002',
    'Pooja Patel',
    'HDFC Ergo',
    8200.00,
    'SUBMITTED',
    'd0000000-0000-0000-0000-000000000004',
    '2026-08-10 14:30:00+00'
),
(
    '10000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'CLM-2026-003',
    'John Doe',
    'Max Bupa',
    1250.00,
    'DRAFT',
    'd0000000-0000-0000-0000-000000000005',
    NULL
)
ON CONFLICT (organization_id, claim_number) DO NOTHING;

-- Claim Status History
INSERT INTO claim_status_history (id, claim_id, old_status, new_status, changed_by, created_at)
VALUES
(
    gen_random_uuid(),
    '10000000-0000-0000-0000-000000000001',
    'DRAFT',
    'SUBMITTED',
    'd0000000-0000-0000-0000-000000000003',
    '2026-08-01 10:00:00+00'
),
(
    gen_random_uuid(),
    '10000000-0000-0000-0000-000000000001',
    'SUBMITTED',
    'UNDER_REVIEW',
    'a0000000-0000-0000-0000-000000000001',
    '2026-08-02 11:15:00+00'
),
(
    gen_random_uuid(),
    '10000000-0000-0000-0000-000000000001',
    'UNDER_REVIEW',
    'APPROVED',
    'a0000000-0000-0000-0000-000000000001',
    '2026-08-04 09:30:00+00'
),
(
    gen_random_uuid(),
    '10000000-0000-0000-0000-000000000002',
    'DRAFT',
    'SUBMITTED',
    'd0000000-0000-0000-0000-000000000004',
    '2026-08-10 14:30:00+00'
)
ON CONFLICT DO NOTHING;

-- Sales & Sale Items
INSERT INTO sales (id, organization_id, branch_id, sale_number, sold_by, sale_date, total_revenue, total_cost, gross_profit)
VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'SAL-001',
    'd0000000-0000-0000-0000-000000000003',
    '2026-08-11 12:00:00+00',
    350.00,
    240.00,
    110.00
),
(
    '20000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'SAL-002',
    'd0000000-0000-0000-0000-000000000004',
    '2026-08-11 15:45:00+00',
    950.00,
    570.00,
    380.00
),
(
    '20000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'SAL-003',
    'd0000000-0000-0000-0000-000000000005',
    '2026-08-12 10:10:00+00',
    150.00,
    100.00,
    50.00
)
ON CONFLICT (organization_id, sale_number) DO NOTHING;

INSERT INTO sale_items (id, sale_id, item_id, batch_id, quantity, unit_cost, selling_price, revenue, cost, profit)
VALUES
-- Sale 1 details
(
    gen_random_uuid(),
    '20000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'f0000000-0000-0000-0000-000000000001',
    2.0,
    120.00,
    175.00,
    350.00,
    240.00,
    110.00
),
-- Sale 2 details
(
    gen_random_uuid(),
    '20000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000003',
    'f0000000-0000-0000-0000-000000000004',
    10.0,
    57.00,
    95.00,
    950.00,
    570.00,
    380.00
),
-- Sale 3 details
(
    gen_random_uuid(),
    '20000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000004',
    'f0000000-0000-0000-0000-000000000005',
    3.0,
    33.33,
    50.00,
    150.00,
    100.00,
    50.00
)
ON CONFLICT DO NOTHING;
