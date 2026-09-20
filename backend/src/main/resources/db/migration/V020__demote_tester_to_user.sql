-- The demo tester is a normal user; admin/admin remains the super-administrator account.
UPDATE TB_M26_USER_AUTH user_auth
JOIN TB_M26_USER app_user ON app_user.USER_ID = user_auth.USER_ID
JOIN TB_M26_AUTH auth ON auth.AUTH_ID = user_auth.AUTH_ID
SET user_auth.DATA_END_STATUS = 'Y',
    user_auth.DATA_END_OBJECT_TYPE = 'S',
    user_auth.DATA_END_OBJECT_ID = 'SYSTEM',
    user_auth.DATA_END_PROGRAM_ID = 'V020_TESTER_ROLE',
    user_auth.DATA_END_TIMESTAMP = CURRENT_TIMESTAMP(),
    user_auth.LAST_UPDATED_OBJECT_TYPE = 'S',
    user_auth.LAST_UPDATED_OBJECT_ID = 'SYSTEM',
    user_auth.LAST_UPDATED_PROGRAM_ID = 'V020_TESTER_ROLE'
WHERE app_user.USER_EMP_NO = 'tester'
  AND auth.AUTH_CODE = 'ADMIN'
  AND user_auth.DATA_END_STATUS = 'N';

INSERT INTO TB_M26_USER_AUTH (
    CREATED_OBJECT_TYPE, CREATED_OBJECT_ID, CREATED_PROGRAM_ID,
    LAST_UPDATED_OBJECT_TYPE, LAST_UPDATED_OBJECT_ID, LAST_UPDATED_PROGRAM_ID,
    USER_ID, AUTH_ID, GRANT_START_DT, GRANT_END_DT, REMARKS
)
SELECT 'S', 'SYSTEM', 'V020_TESTER_ROLE', 'S', 'SYSTEM', 'V020_TESTER_ROLE',
       app_user.USER_ID, auth.AUTH_ID, DATE_FORMAT(CURRENT_DATE(), '%Y%m%d'), NULL,
       'Development/demo standard user authorization'
FROM TB_M26_USER app_user
JOIN TB_M26_AUTH auth ON auth.AUTH_CODE = 'USER'
WHERE app_user.USER_EMP_NO = 'tester'
  AND app_user.DATA_END_STATUS = 'N'
  AND NOT EXISTS (
      SELECT 1
      FROM TB_M26_USER_AUTH existing
      WHERE existing.USER_ID = app_user.USER_ID
        AND existing.AUTH_ID = auth.AUTH_ID
        AND existing.DATA_END_STATUS = 'N'
  );
