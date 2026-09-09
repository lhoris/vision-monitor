-- Initial data for TB_M26_* master tables.
-- The development admin account is seeded in V005/V007/V008 into TB_M26_USERS.

INSERT INTO TB_M26_AUTH (
    created_object_type,
    created_object_id,
    created_program_id,
    created_timestamp,
    last_updated_object_type,
    last_updated_object_id,
    last_updated_program_id,
    last_updated_timestamp,
    AUTH_CODE,
    AUTH_NAME,
    AUTH_TYPE,
    AUTH_DESCRIPTION,
    REMARKS
) VALUES
(
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'ADMIN',
    'Administrator',
    'SYSTEM',
    'Administrator role',
    'Initial administrator role'
),
(
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'S',
    'SYSTEM',
    'V011_SEED',
    CURRENT_TIMESTAMP,
    'USER',
    'User',
    'SYSTEM',
    'Default user role',
    'Initial user role'
)
ON DUPLICATE KEY UPDATE
    AUTH_NAME = VALUES(AUTH_NAME),
    AUTH_TYPE = VALUES(AUTH_TYPE),
    AUTH_DESCRIPTION = VALUES(AUTH_DESCRIPTION),
    REMARKS = VALUES(REMARKS),
    last_updated_timestamp = CURRENT_TIMESTAMP;
