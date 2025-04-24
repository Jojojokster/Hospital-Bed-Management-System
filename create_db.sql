# Create database script for Hospite

# Create the database
CREATE DATABASE Hospite_db;
USE Hospite_db;

# Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('admin','moderator', 'client') DEFAULT 'client',
    PRIMARY KEY(id)
);


# Create the app user and give it access to the database
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON Hospite_db.* TO 'appuser'@'localhost';

# Flush privileges to ensure that all changes take effect
FLUSH PRIVILEGES;

CREATE TABLE Beds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bed_number VARCHAR(50) NOT NULL UNIQUE, -- Unique identifier for each bed
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available', -- Current status of the bed
    patient_id INT NULL, -- Foreign key to link the bed to a patient (NULL if unassigned)
    expected_availability DATETIME NULL, -- When the bed will become available (if occupied or in maintenance)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);