-- Vision Monitor VMS - Database Initialization Script
-- Run this script as root user to set up the database
--
-- Credentials/host below match backend/src/main/resources/application.yml
-- (spring.datasource url/username/password). Update both places together
-- if you change them.
--
-- The app connects to this DB remotely (not from the DB server itself), so
-- the user is created with host '%' (any host) rather than 'localhost'.
-- Narrow this to the app server's specific IP instead of '%' if possible.

-- Create database
CREATE DATABASE IF NOT EXISTS PPWIRE
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user (CREATE OR REPLACE forces password-based auth even if the
-- account already exists with a different authentication plugin, e.g. gssapi)
CREATE OR REPLACE USER 'ppwiredb'@'%' IDENTIFIED BY 'ppwiredb123#$';

-- Grant privileges
GRANT ALL PRIVILEGES ON PPWIRE.* TO 'ppwiredb'@'%';

-- Apply privileges
FLUSH PRIVILEGES;

-- Switch to database
USE PPWIRE;

-- Verify database is created
SELECT 'Database PPWIRE created successfully' AS status;
