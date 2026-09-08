-- Vision Monitor - Master Data Tables (TB_M26_*)
-- 공통코드, 사용자, 권한, 개인화 등 마스터 데이터 테이블

-- =====================================================
-- 1. TB_M26_CODE (공통코드)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_CODE (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    CODE_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '공통코드ID',

    -- Attributes
    CODE_NAME VARCHAR(50) DEFAULT NULL COMMENT '공통코드명',
    CODE_DESCRIPTION VARCHAR(120) DEFAULT NULL COMMENT '공통코드설명',
    CODE_TYPE VARCHAR(20) DEFAULT NULL COMMENT '공통코드유형',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (CODE_ID),
    INDEX idx_code_type (CODE_TYPE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공통코드';

-- =====================================================
-- 2. TB_M26_CODE_DETAIL (공통코드상세)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_CODE_DETAIL (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    CODE_DETAIL_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '공통코드상세ID',

    -- Foreign Key
    CODE_ID INT(15) UNSIGNED NOT NULL COMMENT '공통코드ID',

    -- Attributes
    CODE_VALUE VARCHAR(30) DEFAULT NULL COMMENT '공통코드값',
    CODE_VALUE_NAME VARCHAR(100) DEFAULT NULL COMMENT '공통코드값명',
    CODE_VALUE_DESCRIPTION VARCHAR(1000) DEFAULT NULL COMMENT '공통코드값설명',
    SORT_ORDER INT(2) DEFAULT NULL COMMENT '정렬순서',
    DEFAULT_VALUE VARCHAR(30) DEFAULT NULL COMMENT '기본값',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (CODE_DETAIL_ID),
    FOREIGN KEY (CODE_ID) REFERENCES TB_M26_CODE(CODE_ID) ON DELETE CASCADE,
    INDEX idx_code_id (CODE_ID),
    UNIQUE INDEX uidx_code_value (CODE_ID, CODE_VALUE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공통코드상세';

-- =====================================================
-- 3. TB_M26_USER (사용자)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_USER (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    USER_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ERPUserInternalID',

    -- Attributes
    USER_EMP_NO VARCHAR(20) NOT NULL COMMENT '사용자직번',
    USER_NAME VARCHAR(100) DEFAULT NULL COMMENT 'ERP시스템사용자명',
    ENCRYPTED_FOUNDATION_PASSWORD VARCHAR(100) NOT NULL COMMENT '업무담당자비밀번호',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (USER_ID),
    UNIQUE INDEX uidx_user_emp_no (USER_EMP_NO)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자';

-- =====================================================
-- 4. TB_M26_AUTH (권한)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_AUTH (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    AUTH_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '권한ID',

    -- Attributes
    AUTH_CODE VARCHAR(30) NOT NULL COMMENT '권한코드',
    AUTH_NAME VARCHAR(100) DEFAULT NULL COMMENT '권한명',
    TYPE VARCHAR(8) DEFAULT NULL COMMENT '권한유형',
    AUTH_DESCRIPTION VARCHAR(1000) DEFAULT NULL COMMENT '권한설명',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (AUTH_ID),
    UNIQUE INDEX uidx_auth_code (AUTH_CODE)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='권한';

-- =====================================================
-- 5. TB_M26_USER_AUTH (사용자별 권한)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_USER_AUTH (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    USER_AUTH_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '사용자별권한ID',

    -- Foreign Keys
    USER_ID INT(15) UNSIGNED NOT NULL COMMENT '사용자ID',
    AUTH_ID INT(15) UNSIGNED NOT NULL COMMENT '권한ID',

    -- Attributes
    GRANT_START_DT DATE DEFAULT NULL COMMENT '권한시작일자',
    GRANT_END_DT DATE DEFAULT NULL COMMENT '권한종료일자',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (USER_AUTH_ID),
    FOREIGN KEY (USER_ID) REFERENCES TB_M26_USER(USER_ID) ON DELETE CASCADE,
    FOREIGN KEY (AUTH_ID) REFERENCES TB_M26_AUTH(AUTH_ID) ON DELETE CASCADE,
    INDEX idx_user_id (USER_ID),
    INDEX idx_auth_id (AUTH_ID),
    UNIQUE INDEX uidx_user_auth (USER_ID, AUTH_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 권한';

-- =====================================================
-- 6. TB_M26_USER_PERSONAL (사용자별 개인화)
-- =====================================================
CREATE TABLE IF NOT EXISTS TB_M26_USER_PERSONAL (
    -- AUDIT 항목
    created_object_type VARCHAR(1) DEFAULT NULL COMMENT '생성Object유형',
    created_object_id VARCHAR(22) DEFAULT NULL COMMENT '생성ObjectID',
    created_program_id VARCHAR(22) DEFAULT NULL COMMENT '생성프로그램ID',
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    last_updated_object_type VARCHAR(1) DEFAULT NULL COMMENT '최종변경Object유형',
    last_updated_object_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경ObjectID',
    last_updated_program_id VARCHAR(22) DEFAULT NULL COMMENT '최종변경프로그램ID',
    last_updated_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '최종변경일시',

    -- Primary Key
    USER_PERSONAL_ID INT(15) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '사용자별개인화ID',

    -- Foreign Key
    USER_ID INT(15) UNSIGNED NOT NULL COMMENT '사용자ID',

    -- Attributes
    PERSONAL_NAME VARCHAR(100) DEFAULT NULL COMMENT '개인화설정명',
    PERSONAL_DATA JSON DEFAULT NULL COMMENT '개인화데이터',
    SORT_ORDER INT(5) DEFAULT NULL COMMENT '정렬순서',
    REMARKS VARCHAR(4000) DEFAULT NULL COMMENT '비고',

    PRIMARY KEY (USER_PERSONAL_ID),
    FOREIGN KEY (USER_ID) REFERENCES TB_M26_USER(USER_ID) ON DELETE CASCADE,
    INDEX idx_user_id (USER_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자별 개인화';
