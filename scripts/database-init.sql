-- Vision Monitor VMS - Database Initialization Script
-- Run this script as root user to set up the database

-- Create database
CREATE DATABASE IF NOT EXISTS vision_monitor
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'vision'@'localhost' IDENTIFIED BY 'password';

-- Grant privileges
GRANT ALL PRIVILEGES ON vision_monitor.* TO 'vision'@'localhost';

-- Apply privileges
FLUSH PRIVILEGES;

-- Switch to database
USE vision_monitor;

-- Verify database is created
SELECT 'Database vision_monitor created successfully' AS status;
