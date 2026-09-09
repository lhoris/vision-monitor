-- Organization hierarchy for user affiliation, department, and section.

CREATE TABLE IF NOT EXISTS TB_M26_ORG_UNITS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    parent_id BIGINT NULL,
    unit_type VARCHAR(30) NOT NULL,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_tb_m26_org_units_code UNIQUE (code),
    INDEX idx_tb_m26_org_units_parent_id (parent_id),
    INDEX idx_tb_m26_org_units_type (unit_type),
    INDEX idx_tb_m26_org_units_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE TB_M26_USERS
    ADD COLUMN org_unit_id BIGINT NULL AFTER role,
    ADD INDEX idx_tb_m26_users_org_unit_id (org_unit_id);
