-- Password hash used by the real backend login API.

ALTER TABLE TB_M26_USERS
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER username;
