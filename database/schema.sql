CREATE DATABASE IF NOT EXISTS `ccggm_academico` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ccggm_academico`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','teacher') NOT NULL DEFAULT 'teacher',
  `full_name` VARCHAR(150) DEFAULT NULL,
  `must_change_password` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` VARCHAR(128) NOT NULL,
  `expires` INT UNSIGNED NOT NULL,
  `data` MEDIUMTEXT NOT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `students` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `gender` ENUM('Masculino','Femenino','Otro') DEFAULT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `grade_level` VARCHAR(50) DEFAULT NULL,
  `section` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_students_grade` (`grade_level`),
  KEY `idx_students_section` (`section`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `specialty` VARCHAR(150) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teachers_user` (`user_id`),
  KEY `idx_teachers_status` (`status`),
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `academic_periods` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_periods_active` (`active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grade_scales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL DEFAULT 'Escala general',
  `min_pass_score` DECIMAL(5,2) NOT NULL DEFAULT 6.00,
  `numeric_min` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `numeric_max` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) DEFAULT NULL,
  `grade_level` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subjects_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `teacher_subjects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `teacher_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `grade_level` VARCHAR(50) DEFAULT NULL,
  `section` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_teacher_subject` (`teacher_id`, `subject_id`, `grade_level`, `section`),
  KEY `idx_teacher_subject_teacher` (`teacher_id`),
  KEY `idx_teacher_subject_subject` (`subject_id`),
  CONSTRAINT `fk_teacher_subject_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_subject_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `grades` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_id` INT UNSIGNED NOT NULL,
  `teacher_id` INT UNSIGNED NOT NULL,
  `subject_id` INT UNSIGNED NOT NULL,
  `period_id` INT UNSIGNED NOT NULL,
  `grade_1` DECIMAL(5,2) DEFAULT NULL,
  `grade_2` DECIMAL(5,2) DEFAULT NULL,
  `grade_3` DECIMAL(5,2) DEFAULT NULL,
  `average` DECIMAL(5,2) DEFAULT NULL,
  `status` ENUM('aprobado','reprobado','pendiente') DEFAULT 'pendiente',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_student_subject_period` (`student_id`, `subject_id`, `period_id`),
  KEY `idx_grades_student` (`student_id`),
  KEY `idx_grades_teacher` (`teacher_id`),
  KEY `idx_grades_subject` (`subject_id`),
  CONSTRAINT `fk_grades_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grades_period` FOREIGN KEY (`period_id`) REFERENCES `academic_periods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `entity` VARCHAR(100) DEFAULT NULL,
  `action` VARCHAR(100) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `grade_scales` (`name`, `min_pass_score`, `numeric_min`, `numeric_max`)
VALUES ('Escala general', 6.00, 0.00, 10.00)
ON DUPLICATE KEY UPDATE `min_pass_score` = VALUES(`min_pass_score`);
