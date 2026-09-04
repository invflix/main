# MediStock Database Schema

This document details all PostgreSQL tables, indexes, and primary constraints.

## core tables

### users
Stores user account records.
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE INDEX
- `password_hash` VARCHAR(255)
- `full_name` VARCHAR(255)
- `is_active` BOOLEAN
- `is_platform_admin` BOOLEAN

### organizations
Stores company entities.
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255)

### branches
Pharmacy branches inside organizations.
- `id` UUID PRIMARY KEY
- `organization_id` UUID FK (organizations)
- `branch_code` VARCHAR(100)
- UNIQUE (organization_id, branch_code)

### organization_members & branch_members
Enforces security boundaries.
- `uq_organization_user` (organization_id, user_id)
- `uq_branch_user` (branch_id, user_id)

---

## inventory tables

### items
Item master catalog.
- `uq_organization_item_code` (organization_id, item_code)

### item_batches
Lots/batches tracking.
- `uq_organization_item_lot` (organization_id, item_id, lot_number)

### branch_inventory
Stock details.
- Holds quantities, unit price, and value.

---

## claims & sales

### insurance_claims
Insurance payouts tracking.

### sales & sale_items
POS registry and gross margin profit calculators.
