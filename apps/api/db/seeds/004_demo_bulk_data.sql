-- Seeds: 004_demo_bulk_data.sql
-- Add a larger Invflix demo dataset for dashboards, inventory, claims, and sales.

WITH generated_items AS (
    SELECT
        n,
        'DEMO-' || lpad(n::text, 3, '0') AS item_code,
        (ARRAY[
            'Paracetamol 650mg', 'Azithromycin 500mg', 'Cetirizine 10mg',
            'Pantoprazole 40mg', 'Metformin 500mg', 'Amlodipine 5mg',
            'Atorvastatin 10mg', 'Amoxicillin 500mg', 'ORS Sachet',
            'Vitamin D3 60000 IU'
        ])[((n - 1) % 10) + 1] || ' #' || n AS item_name,
        (ARRAY['Analgesics', 'Antibiotics', 'Antihistamines', 'Gastro Care', 'Diabetes Care', 'Cardiac Care', 'Supplements'])[((n - 1) % 7) + 1] AS item_class,
        (ARRAY['Box', 'Strip', 'Bottle', 'Pack'])[((n - 1) % 4) + 1] AS primary_uom,
        (ARRAY['Tablet', 'Capsule', 'Sachet', 'Unit'])[((n - 1) % 4) + 1] AS secondary_uom
    FROM generate_series(1, 60) AS n
)
INSERT INTO items (
    organization_id,
    item_code,
    item_name,
    item_class,
    description,
    primary_uom,
    secondary_uom,
    secondary_uom_conversion,
    part_number,
    alternative_available
)
SELECT
    'b0000000-0000-0000-0000-000000000001',
    item_code,
    item_name,
    item_class,
    'Demo pharmacy inventory item for Invflix branch operations',
    primary_uom,
    secondary_uom,
    CASE WHEN secondary_uom IN ('Tablet', 'Capsule') THEN 10 ELSE 1 END,
    'INV-' || item_code,
    n % 3 = 0
FROM generated_items
ON CONFLICT (organization_id, item_code) DO UPDATE
SET item_name = EXCLUDED.item_name,
    item_class = EXCLUDED.item_class,
    description = EXCLUDED.description,
    primary_uom = EXCLUDED.primary_uom,
    secondary_uom = EXCLUDED.secondary_uom,
    secondary_uom_conversion = EXCLUDED.secondary_uom_conversion,
    part_number = EXCLUDED.part_number,
    alternative_available = EXCLUDED.alternative_available;

WITH demo_items AS (
    SELECT
        id,
        item_code,
        row_number() OVER (ORDER BY item_code) AS n
    FROM items
    WHERE organization_id = 'b0000000-0000-0000-0000-000000000001'
      AND item_code LIKE 'DEMO-%'
)
INSERT INTO item_batches (organization_id, item_id, lot_number, expiry_date)
SELECT
    'b0000000-0000-0000-0000-000000000001',
    id,
    'BULK-' || item_code,
    CURRENT_DATE + (((n % 18) - 3) * INTERVAL '30 days')
FROM demo_items
ON CONFLICT (organization_id, item_id, lot_number) DO UPDATE
SET expiry_date = EXCLUDED.expiry_date;

WITH stock_rows AS (
    SELECT
        i.id AS item_id,
        b.id AS batch_id,
        i.item_code,
        row_number() OVER (ORDER BY i.item_code) AS n
    FROM items i
    JOIN item_batches b
      ON b.organization_id = i.organization_id
     AND b.item_id = i.id
     AND b.lot_number = 'BULK-' || i.item_code
    WHERE i.organization_id = 'b0000000-0000-0000-0000-000000000001'
      AND i.item_code LIKE 'DEMO-%'
)
INSERT INTO branch_inventory (
    organization_id,
    branch_id,
    item_id,
    batch_id,
    locator,
    primary_quantity,
    secondary_quantity,
    unit_price,
    inventory_value
)
SELECT
    'b0000000-0000-0000-0000-000000000001',
    (ARRAY[
        'c0000000-0000-0000-0000-000000000001'::uuid,
        'c0000000-0000-0000-0000-000000000002'::uuid,
        'c0000000-0000-0000-0000-000000000003'::uuid
    ])[((n - 1) % 3) + 1],
    item_id,
    batch_id,
    'Demo-' || chr(65 + ((n - 1) % 6)::int) || ((n % 9) + 1)::text,
    25 + (n * 7 % 240),
    (25 + (n * 7 % 240)) * 10,
    18 + (n * 11 % 480),
    (25 + (n * 7 % 240)) * (18 + (n * 11 % 480))
FROM stock_rows sr
WHERE NOT EXISTS (
    SELECT 1
    FROM branch_inventory bi
    WHERE bi.organization_id = 'b0000000-0000-0000-0000-000000000001'
      AND bi.branch_id = (ARRAY[
          'c0000000-0000-0000-0000-000000000001'::uuid,
          'c0000000-0000-0000-0000-000000000002'::uuid,
          'c0000000-0000-0000-0000-000000000003'::uuid
      ])[((sr.n - 1) % 3) + 1]
      AND bi.item_id = sr.item_id
      AND bi.batch_id = sr.batch_id
);

WITH claim_rows AS (
    SELECT generate_series(1, 15) AS n
)
INSERT INTO insurance_claims (
    id,
    organization_id,
    branch_id,
    claim_number,
    patient_name,
    insurance_provider,
    claim_amount,
    status,
    assigned_to,
    submitted_at
)
SELECT
    ('11000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
    'b0000000-0000-0000-0000-000000000001',
    (ARRAY[
        'c0000000-0000-0000-0000-000000000001'::uuid,
        'c0000000-0000-0000-0000-000000000002'::uuid,
        'c0000000-0000-0000-0000-000000000003'::uuid
    ])[((n - 1) % 3) + 1],
    'CLM-DEMO-' || lpad(n::text, 3, '0'),
    (ARRAY['Aarav Mehta', 'Diya Sharma', 'Kabir Singh', 'Mira Patel', 'Rohan Gupta'])[((n - 1) % 5) + 1] || ' ' || n,
    (ARRAY['Star Health', 'HDFC Ergo', 'Care Health', 'Niva Bupa'])[((n - 1) % 4) + 1],
    900 + (n * 375),
    (ARRAY['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'])[((n - 1) % 5) + 1],
    (ARRAY[
        'd0000000-0000-0000-0000-000000000001'::uuid,
        'd0000000-0000-0000-0000-000000000002'::uuid,
        'a0000000-0000-0000-0000-000000000001'::uuid
    ])[((n - 1) % 3) + 1],
    CASE WHEN n % 5 = 1 THEN NULL ELSE NOW() - (n || ' days')::interval END
FROM claim_rows
ON CONFLICT (organization_id, claim_number) DO UPDATE
SET claim_amount = EXCLUDED.claim_amount,
    status = EXCLUDED.status,
    assigned_to = EXCLUDED.assigned_to,
    submitted_at = EXCLUDED.submitted_at;

WITH sale_rows AS (
    SELECT generate_series(1, 20) AS n
)
INSERT INTO sales (
    id,
    organization_id,
    branch_id,
    sale_number,
    sold_by,
    sale_date,
    total_revenue,
    total_cost,
    gross_profit
)
SELECT
    ('21000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
    'b0000000-0000-0000-0000-000000000001',
    (ARRAY[
        'c0000000-0000-0000-0000-000000000001'::uuid,
        'c0000000-0000-0000-0000-000000000002'::uuid,
        'c0000000-0000-0000-0000-000000000003'::uuid
    ])[((n - 1) % 3) + 1],
    'SAL-DEMO-' || lpad(n::text, 3, '0'),
    (ARRAY[
        'd0000000-0000-0000-0000-000000000001'::uuid,
        'd0000000-0000-0000-0000-000000000002'::uuid,
        'a0000000-0000-0000-0000-000000000001'::uuid
    ])[((n - 1) % 3) + 1],
    NOW() - (n || ' days')::interval,
    450 + (n * 125),
    300 + (n * 82),
    (450 + (n * 125)) - (300 + (n * 82))
FROM sale_rows
ON CONFLICT (organization_id, sale_number) DO UPDATE
SET sale_date = EXCLUDED.sale_date,
    total_revenue = EXCLUDED.total_revenue,
    total_cost = EXCLUDED.total_cost,
    gross_profit = EXCLUDED.gross_profit;

WITH numbered_sales AS (
    SELECT
        id,
        sale_number,
        row_number() OVER (ORDER BY sale_number) AS n
    FROM sales
    WHERE organization_id = 'b0000000-0000-0000-0000-000000000001'
      AND sale_number LIKE 'SAL-DEMO-%'
),
numbered_items AS (
    SELECT
        i.id AS item_id,
        b.id AS batch_id,
        row_number() OVER (ORDER BY i.item_code) AS n
    FROM items i
    JOIN item_batches b
      ON b.organization_id = i.organization_id
     AND b.item_id = i.id
     AND b.lot_number = 'BULK-' || i.item_code
    WHERE i.organization_id = 'b0000000-0000-0000-0000-000000000001'
      AND i.item_code LIKE 'DEMO-%'
)
INSERT INTO sale_items (
    id,
    sale_id,
    item_id,
    batch_id,
    quantity,
    unit_cost,
    selling_price,
    revenue,
    cost,
    profit
)
SELECT
    gen_random_uuid(),
    s.id,
    i.item_id,
    i.batch_id,
    1 + (s.n % 5),
    45 + (s.n * 3),
    70 + (s.n * 5),
    (1 + (s.n % 5)) * (70 + (s.n * 5)),
    (1 + (s.n % 5)) * (45 + (s.n * 3)),
    ((1 + (s.n % 5)) * (70 + (s.n * 5))) - ((1 + (s.n % 5)) * (45 + (s.n * 3)))
FROM numbered_sales s
JOIN numbered_items i ON i.n = ((s.n - 1) % 60) + 1
WHERE NOT EXISTS (
    SELECT 1
    FROM sale_items si
    WHERE si.sale_id = s.id
);
