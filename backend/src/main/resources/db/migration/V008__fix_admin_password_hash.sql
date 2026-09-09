-- Correct the development administrator BCrypt hash.
-- Plain password for local development: admin

UPDATE TB_M26_USERS
SET password_hash = '$2a$10$iesj5TNE8XER1dM2e4t2/.IE3nMM151L1lYQi3CHS2LpMZRgzscZa',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 'system'
WHERE username = 'admin';
