-- Vision Monitor - Master Data Seeding
-- Initial data for TB_M26_* tables

-- =====================================================
-- 1. Seed TB_M26_USER (사용자)
-- =====================================================
INSERT INTO TB_M26_USER (
    created_object_type,
    created_object_id,
    created_program_id,
    created_timestamp,
    last_updated_object_type,
    last_updated_object_id,
    last_updated_program_id,
    last_updated_timestamp,
    USER_EMP_NO,
    USER_NAME,
    ENCRYPTED_FOUNDATION_PASSWORD,
    REMARKS
) VALUES
-- Admin User
(
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'admin',
    'Administrator',
    '$2b$10$.UdMNAaF21hGMvxpoEZGt.olmXNrzp57nSsLuttI9zaXSYYA3GqW.',
    'Initial admin account'
),
-- POSCO User
(
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'pd0a5661',
    'Park Dong Hyun',
    '$2b$10$q8XfmaLZ1pNv4Q.3tZwJeO7BdufoW17mKMwGgmeuGmdk4ky4WW7Zy',
    'POSCO User'
)
ON DUPLICATE KEY UPDATE
    USER_NAME = VALUES(USER_NAME),
    ENCRYPTED_FOUNDATION_PASSWORD = VALUES(ENCRYPTED_FOUNDATION_PASSWORD),
    REMARKS = VALUES(REMARKS),
    last_updated_timestamp = CURRENT_TIMESTAMP;
