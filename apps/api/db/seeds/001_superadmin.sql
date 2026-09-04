-- Seeds: 001_superadmin.sql
-- Seed a Platform Super Admin
-- Password is 'password123'
INSERT INTO users (id, email, password_hash, full_name, is_platform_admin, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'abhyudaya@chaibytes.in',
    '$2b$12$kaxKuNNl11AZx/DCOut6jeUOeNXAsFnV3xTGZpVm4BAvIJz5i25DO',
    'Platform Super Admin',
    TRUE,
    TRUE
)
ON CONFLICT (email) DO NOTHING;
