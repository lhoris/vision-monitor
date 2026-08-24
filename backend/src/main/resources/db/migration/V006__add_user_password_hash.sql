-- Password hash used by the real backend login API.

ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) NULL AFTER username;
