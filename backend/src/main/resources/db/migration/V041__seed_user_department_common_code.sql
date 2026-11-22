-- 회원가입 부서 선택용 공통코드
INSERT INTO TB_M26_CODE (
    CODE_NAME, CODE_DESCRIPTION, CODE_TYPE, REMARKS, DATA_END_STATUS
)
SELECT 'USER_DEPARTMENT', '사용자 부서', 'SYSTEM', '회원가입 및 사용자 부서 분류', 'N'
WHERE NOT EXISTS (
    SELECT 1 FROM TB_M26_CODE WHERE UPPER(CODE_NAME) = 'USER_DEPARTMENT'
);

INSERT INTO TB_M26_CODE_DETAIL (
    CODE_ID, CODE_VALUE, CODE_VALUE_NAME, CODE_VALUE_NAME_KO, CODE_VALUE_NAME_EN,
    CODE_VALUE_DESCRIPTION, SORT_ORDER, DEFAULT_VALUE, REMARKS, DATA_END_STATUS
)
SELECT code.CODE_ID, department.CODE_VALUE, department.CODE_VALUE_NAME,
       department.CODE_VALUE_NAME_KO, department.CODE_VALUE_NAME_EN,
       department.CODE_VALUE_DESCRIPTION, department.SORT_ORDER,
       department.DEFAULT_VALUE, department.REMARKS, 'N'
FROM TB_M26_CODE code
JOIN (
    SELECT 'FACTORY_4_SUNJAE' AS CODE_VALUE, '4선재공장' AS CODE_VALUE_NAME, '4선재공장' AS CODE_VALUE_NAME_KO,
           '4 Wire Rod Factory' AS CODE_VALUE_NAME_EN, '4선재공장' AS CODE_VALUE_DESCRIPTION, 10 AS SORT_ORDER,
           'N' AS DEFAULT_VALUE, '회원가입 부서' AS REMARKS
    UNION ALL SELECT 'WIRE_ROD_TECH_DEV', '선재부 기술개발섹션', '선재부 기술개발섹션', 'Wire Rod Technical Development Section', '선재부 기술개발섹션', 20, 'N', '회원가입 부서'
    UNION ALL SELECT 'WIRE_ROD_OPERATION_SAFETY', '선재부 조업안전섹션', '선재부 조업안전섹션', 'Wire Rod Operation Safety Section', '선재부 조업안전섹션', 30, 'N', '회원가입 부서'
    UNION ALL SELECT 'OTHER', '기타', '기타', 'Other', '기타', 40, 'N', '회원가입 부서'
) department ON 1 = 1
WHERE UPPER(code.CODE_NAME) = 'USER_DEPARTMENT'
  AND NOT EXISTS (
      SELECT 1 FROM TB_M26_CODE_DETAIL detail
      WHERE detail.CODE_ID = code.CODE_ID
        AND UPPER(detail.CODE_VALUE) = department.CODE_VALUE
  );
