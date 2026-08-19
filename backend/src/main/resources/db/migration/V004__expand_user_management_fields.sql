-- User management fields used by the backend API.

ALTER TABLE users
    MODIFY COLUMN email VARCHAR(255) NULL,
    ADD COLUMN name VARCHAR(255) NULL AFTER username,
    ADD COLUMN display_name VARCHAR(255) NULL AFTER name,
    ADD COLUMN department VARCHAR(255) NULL AFTER display_name,
    ADD COLUMN position VARCHAR(255) NULL AFTER department,
    ADD COLUMN phone VARCHAR(50) NULL AFTER email,
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'active' AFTER enabled,
    ADD COLUMN employment_status VARCHAR(20) NOT NULL DEFAULT 'employed' AFTER account_status,
    ADD COLUMN last_login_at DATETIME NULL AFTER employment_status,
    ADD COLUMN created_by VARCHAR(255) NULL AFTER created_at,
    ADD COLUMN updated_by VARCHAR(255) NULL AFTER created_by,
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0 AFTER updated_by,
    ADD COLUMN deletion_requested_at DATETIME NULL AFTER version,
    ADD COLUMN deletion_requested_by VARCHAR(255) NULL AFTER deletion_requested_at,
    ADD COLUMN deletion_reason VARCHAR(500) NULL AFTER deletion_requested_by;

UPDATE users
SET account_status = CASE WHEN enabled = TRUE THEN 'active' ELSE 'disabled' END;
