-- Seed the development administrator password as a BCrypt hash.
-- Plain password for local development: admin

INSERT INTO TB_M26_USERS (
    username,
    password_hash,
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
    '$2a$10$wuWXa/hwpl7jxTu1D6LTWu0GjOiIi.eKs0Pepl5tfBmGhEUZ96Z2a',
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
    password_hash = VALUES(password_hash),
    role = 'ADMIN',
    enabled = TRUE,
    account_status = 'active',
    employment_status = 'employed',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'system';
