# MediStock Architecture

This document describes the design patterns, structure, and operational boundaries of the MediStock platform.

## System Boundaries

MediStock enforces three layers of access:
1. **Platform Boundary**: Users with `is_platform_admin` set to True are platform-wide Super Admins. They bypass tenant boundaries when organization context is explicitly supplied.
2. **Organization Boundary**: The `organization_id` acts as the primary tenant/security boundary. Members of Organisation A can never query or manipulate Organisation B's resources.
3. **Branch Boundary**: The `branch_id` restricts operational visibility. Managers, pharmacists, staff, and cashiers can only perform actions (viewing inventory, claims, sales, etc.) within branches they are explicitly mapped to. Owners have implicit access to all branches inside their organization.

## Role-Based Access Control (RBAC)

RBAC permission gates are centralized in [permissions.py](file:///Users/abhyudayadubey/Desktop/chaibytes-saas/medi-stock/apps/api/app/core/permissions.py).
- **OWNER**: full admin privileges across the tenant.
- **MANAGER**: full control over assigned branches.
- **PHARMACIST**: inventory, expiry view; view/manage claims in assigned branches.
- **STAFF**: view inventory, view claims in assigned branches.
- **CASHIER**: inventory lookup and manual sales entry.

## Background Jobs Architecture

Celery task manager coordinates with Valkey as the message broker.
- **Inventory Excel Import**: Asynchronous parsing, column-mapping, validation, and database upserts.
- **Async Emails**: Send invitation links to team members.
- **Expiry Notification**: Hourly check of batch dates.
