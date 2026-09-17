-- User role display values are managed as common codes.

INSERT INTO TB_M26_CODE (
    CODE_NAME, CODE_DESCRIPTION, CODE_TYPE, REMARKS, DATA_END_STATUS
)
SELECT 'USER_ROLE', '사용자 권한 역할', 'SYSTEM', 'User role options for user management screens', 'N'
WHERE NOT EXISTS (
    SELECT 1
    FROM TB_M26_CODE
    WHERE UPPER(CODE_NAME) = 'USER_ROLE'
);

INSERT INTO TB_M26_CODE_DETAIL (
    CODE_ID, CODE_VALUE, CODE_VALUE_NAME, CODE_VALUE_NAME_KO, CODE_VALUE_NAME_EN,
    CODE_VALUE_DESCRIPTION, SORT_ORDER, DEFAULT_VALUE, REMARKS, DATA_END_STATUS
)
SELECT code.CODE_ID, role.CODE_VALUE, role.CODE_VALUE_NAME, role.CODE_VALUE_NAME_KO, role.CODE_VALUE_NAME_EN,
       role.CODE_VALUE_DESCRIPTION, role.SORT_ORDER, role.DEFAULT_VALUE, role.REMARKS, 'N'
FROM TB_M26_CODE code
JOIN (
    SELECT 'ADMIN' AS CODE_VALUE, '최고관리자' AS CODE_VALUE_NAME, '최고관리자' AS CODE_VALUE_NAME_KO,
           'Super Admin' AS CODE_VALUE_NAME_EN, '시스템 전체 관리와 사용자관리 접근' AS CODE_VALUE_DESCRIPTION,
           10 AS SORT_ORDER, 'N' AS DEFAULT_VALUE, 'System administrator role' AS REMARKS
    UNION ALL
    SELECT 'MANAGER', '관리자', '관리자', 'Manager', '현장 운영 관리', 20, 'N', 'Middle-tier manager role'
    UNION ALL
    SELECT 'USER', '일반 사용자', '일반 사용자', 'User', '허용된 화면 조회와 기본 사용', 30, 'Y', 'Default user role'
) role ON 1 = 1
WHERE UPPER(code.CODE_NAME) = 'USER_ROLE'
  AND NOT EXISTS (
      SELECT 1
      FROM TB_M26_CODE_DETAIL detail
      WHERE detail.CODE_ID = code.CODE_ID
        AND UPPER(detail.CODE_VALUE) = role.CODE_VALUE
  );
