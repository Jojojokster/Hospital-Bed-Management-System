# Create database script for Hospite

# Create the database
CREATE DATABASE Hospite_db;
USE Hospite_db;

# Create the users table
USE hospite_db;
SELECT * FROM users;CREATE TABLE `beds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bed_number` varchar(255) NOT NULL,
  `ward` varchar(255) DEFAULT NULL,
  `room` varchar(255) NOT NULL,
  `floor` int NOT NULL,
  `status` enum('available','occupied','maintenance') DEFAULT 'available',
  `patient_id` int DEFAULT NULL,
  `expected_availability` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `beds_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE SET NULL ON UPDATE CASCADE
) 

CREATE TABLE `patients` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `patient_forename` varchar(255) NOT NULL,
  `patient_surname` varchar(255) NOT NULL,
  `admission_datetime` datetime NOT NULL,
  `rcount` enum('0','1','2','3','4','5+') NOT NULL DEFAULT '0',
  `gender` enum('F','M') NOT NULL,
  `admission` enum('emergency','outpatient','inpatient','day_patient','urgent','routine','elective','direct','holding') NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) NOT NULL,
  `reason_for_stay` varchar(255) NOT NULL,
  `extension_reason` varchar(255) DEFAULT NULL,
  `discharged` tinyint(1) NOT NULL DEFAULT '0',
  `dialysisrenalendstage` tinyint(1) NOT NULL DEFAULT '0',
  `asthma` tinyint(1) NOT NULL DEFAULT '0',
  `irondef` tinyint(1) NOT NULL DEFAULT '0',
  `pneum` tinyint(1) NOT NULL DEFAULT '0',
  `substancedependence` tinyint(1) NOT NULL DEFAULT '0',
  `psychologicaldisordermajor` tinyint(1) NOT NULL DEFAULT '0',
  `depress` tinyint(1) NOT NULL DEFAULT '0',
  `psychother` tinyint(1) NOT NULL DEFAULT '0',
  `fibrosisandother` tinyint(1) NOT NULL DEFAULT '0',
  `malnutrition` tinyint(1) NOT NULL DEFAULT '0',
  `hemo` tinyint(1) NOT NULL DEFAULT '0',
  `hematocrit` float DEFAULT NULL,
  `neutrophils` float DEFAULT NULL,
  `sodium` float DEFAULT NULL,
  `glucose` float DEFAULT NULL,
  `bloodureanitro` float DEFAULT NULL,
  `creatinine` float DEFAULT NULL,
  `bmi` float DEFAULT NULL,
  `pulse` int DEFAULT NULL,
  `respiration` float DEFAULT NULL,
  `secondarydiagnosisnonicd9` int DEFAULT NULL,
  `predicted_length_of_stay` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`patient_id`),
  UNIQUE KEY `email` (`email`)
)

CREATE TABLE `readmissionlogs` (
  `readmission_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `readmission_date` datetime NOT NULL,
  `reason` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`readmission_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `readmissionlogs_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`patient_id`) ON DELETE CASCADE ON UPDATE CASCADE
) 

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','moderator','client') DEFAULT NULL,
  `passwordResetToken` varchar(255) DEFAULT NULL,
  `passwordResetTokenExpires` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`)
)