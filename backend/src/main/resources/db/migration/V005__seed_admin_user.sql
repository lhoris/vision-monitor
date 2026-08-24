-- Seed an initial administrator account for user-management API authorization.
-- Authentication is not implemented yet, so this account is used as an actor
-- through the X-Actor-Username request header.

INSERT INTO users (
    username,
    name,
    display_name,
    email,
    role,
    enabled,
    account_status,
    employment_status,
    created_at,
    updated_at,
    created_by,
    updated_by,
    version
) VALUES (
    'admin',
    'Admin',
    'Administrator',
    'admin@example.com',
    'ADMIN',
    TRUE,
    'active',
    'employed',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    'system',
    'system',
    0
)
ON DUPLICATE KEY UPDATE
    role = 'ADMIN',
    enabled = TRUE,
    account_status = 'active',
    employment_status = 'employed',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'system';
