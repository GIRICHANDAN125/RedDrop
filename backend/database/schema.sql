-- Create Database
CREATE DATABASE IF NOT EXISTS reddrop_ai;
USE reddrop_ai;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('donor', 'receiver', 'hospital', 'admin') DEFAULT 'receiver',
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    avatar_url VARCHAR(255) NULL,
    avatar_public_id VARCHAR(255) NULL,
    location_lat DECIMAL(10, 8) NULL,
    location_lng DECIMAL(11, 8) NULL,
    address VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(20) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    fcm_token VARCHAR(255) NULL,
    last_seen DATETIME NULL,
    total_donations INT DEFAULT 0,
    rating_average DECIMAL(3, 2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    otp_code VARCHAR(10) NULL,
    otp_expires_at DATETIME NULL,
    otp_purpose VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donors Table
CREATE TABLE IF NOT EXISTS donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE NULL,
    hemoglobin_level DECIMAL(5, 2) NULL,
    weight DECIMAL(5, 2) NULL,
    age INT NULL,
    has_chronic_disease BOOLEAN DEFAULT FALSE,
    is_fit_to_donate BOOLEAN DEFAULT TRUE,
    total_donations INT DEFAULT 0,
    lives_saved INT DEFAULT 0,
    requests_accepted INT DEFAULT 0,
    requests_declined INT DEFAULT 0,
    response_rate DECIMAL(5, 2) DEFAULT 100,
    is_verified BOOLEAN DEFAULT FALSE,
    preferred_contact_method ENUM('phone', 'app', 'both') DEFAULT 'both',
    max_distance_km INT DEFAULT 20,
    emergency_contact_name VARCHAR(100) NULL,
    emergency_contact_phone VARCHAR(20) NULL,
    emergency_contact_relation VARCHAR(50) NULL,
    is_profile_complete BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(50) NOT NULL UNIQUE,
    requester_id INT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_required INT NOT NULL CHECK (units_required BETWEEN 1 AND 10),
    units_fulfilled INT DEFAULT 0,
    emergency_level ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    hospital_name VARCHAR(150) NOT NULL,
    hospital_address VARCHAR(255) NULL,
    hospital_city VARCHAR(100) NOT NULL,
    hospital_state VARCHAR(100) NULL,
    hospital_pincode VARCHAR(20) NULL,
    hospital_lat DECIMAL(10, 8) NULL,
    hospital_lng DECIMAL(11, 8) NULL,
    hospital_contact_number VARCHAR(20) NULL,
    status ENUM('pending', 'searching', 'donor_found', 'in_transit', 'at_hospital', 'completed', 'cancelled', 'expired') DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    notes TEXT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assigned Donors (Donations) Join Table
CREATE TABLE IF NOT EXISTS assigned_donors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    donor_id INT NOT NULL,
    units INT DEFAULT 1,
    status ENUM('pending', 'accepted', 'declined', 'donated', 'no_response') DEFAULT 'pending',
    distance DECIMAL(10, 2) NULL,
    eta_minutes INT NULL,
    accepted_at DATETIME NULL,
    donated_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    UNIQUE (request_id, donor_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL,
    priority ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Request Timeline Table (For Tracking)
CREATE TABLE IF NOT EXISTS request_timelines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT NULL,
    updated_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX idx_donors_blood_group ON donors(is_available);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
