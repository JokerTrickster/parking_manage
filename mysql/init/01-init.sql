-- Parking Management System Database Initialization

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS parking_manage;
USE parking_manage;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(200),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    file_type ENUM('learning', 'test') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Parking test results table
CREATE TABLE IF NOT EXISTS parking_test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    var_threshold DECIMAL(5,2) NOT NULL,
    learning_path VARCHAR(500),
    test_image_path VARCHAR(500),
    result_path VARCHAR(500),
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Insert default projects
INSERT INTO projects (id, name, description, location, status) VALUES
('banpo', '서울 반포', '서울 반포 주차장 관리 시스템', '서울특별시 서초구 반포동', 'active'),
('gwangju', '전라남도 광주', '전라남도 광주 주차장 관리 시스템', '전라남도 광주시', 'inactive'),
('mokpo', '목포', '목포 주차장 관리 시스템', '전라남도 목포시', 'active'),
('pohang', '포항', '포항 주차장 관리 시스템', '경상북도 포항시', 'active'),
('busan', '부산', '부산 주차장 관리 시스템', '부산광역시', 'inactive')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    location = VALUES(location),
    status = VALUES(status),
    updated_at = CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX idx_file_uploads_file_type ON file_uploads(file_type);
CREATE INDEX idx_parking_test_results_project_id ON parking_test_results(project_id);
CREATE INDEX idx_parking_test_results_status ON parking_test_results(status); 