-- =====================================================================
-- RedDrop AI V2 — Complete Frozen Production Schema
-- =====================================================================

CREATE DATABASE IF NOT EXISTS reddropai_v2
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reddropai_v2;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Fixed Roles Lookup Table
CREATE TABLE IF NOT EXISTS roles (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        ENUM('donor', 'patient', 'hospital', 'admin', 'volunteer', 'organization') NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Core Auth Users Table
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(150) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password       VARCHAR(255) NULL,
    is_active      BOOLEAN DEFAULT TRUE,
    fcm_token      VARCHAR(255) NULL,
    last_seen      DATETIME NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- 3. User Roles Junction Table
CREATE TABLE IF NOT EXISTS user_roles (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    role_id    INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (user_id, role_id)
) ENGINE=InnoDB;

CREATE INDEX idx_user_roles_user ON user_roles(user_id);

-- 4. User Core Profiles Table (1:1 with users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id                          INT AUTO_INCREMENT PRIMARY KEY,
    user_id                     INT NOT NULL UNIQUE,
    name                        VARCHAR(100) NULL,
    phone                       VARCHAR(20) NULL UNIQUE,
    gender                      ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    dob                         DATE NULL,
    blood_group                 ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    avatar_url                  VARCHAR(255) NULL,
    avatar_public_id            VARCHAR(255) NULL,
    emergency_contact_name      VARCHAR(100) NULL,
    emergency_contact_phone     VARCHAR(20) NULL,
    emergency_contact_relation  VARCHAR(50) NULL,
    address                     VARCHAR(255) NULL,
    city                        VARCHAR(100) NULL,
    state                       VARCHAR(100) NULL,
    pincode                     VARCHAR(20) NULL,
    location_lat                DECIMAL(10, 8) NULL,
    location_lng                DECIMAL(11, 8) NULL,
    medical_conditions          TEXT NULL,
    is_profile_complete         BOOLEAN DEFAULT FALSE,
    created_at                  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_user_profiles_location ON user_profiles(location_lat, location_lng);
CREATE INDEX idx_user_profiles_blood_group ON user_profiles(blood_group);

-- 5. Donor Specific Profiles Table
CREATE TABLE IF NOT EXISTS donor_profiles (
    id                       INT AUTO_INCREMENT PRIMARY KEY,
    user_id                  INT NOT NULL UNIQUE,
    is_available             BOOLEAN DEFAULT TRUE,
    last_donation_date       DATE NULL,
    hemoglobin_level         DECIMAL(5, 2) NULL,
    weight                   DECIMAL(5, 2) NULL,
    age                      INT NULL,
    has_chronic_disease      BOOLEAN DEFAULT FALSE,
    is_fit_to_donate         BOOLEAN DEFAULT TRUE,
    total_donations          INT DEFAULT 0,
    lives_saved              INT DEFAULT 0,
    requests_accepted        INT DEFAULT 0,
    requests_declined        INT DEFAULT 0,
    response_rate            DECIMAL(5, 2) DEFAULT 100.00,
    is_verified              BOOLEAN DEFAULT FALSE,
    max_distance_km          INT DEFAULT 20,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_donor_profiles_available ON donor_profiles(is_available);

-- 6. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL UNIQUE,
    primary_hospital_id INT NULL,
    medical_notes       TEXT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Hospital Profiles Table
CREATE TABLE IF NOT EXISTS hospital_profiles (
    id                        INT AUTO_INCREMENT PRIMARY KEY,
    user_id                   INT NOT NULL UNIQUE,
    hospital_name             VARCHAR(150) NOT NULL,
    registration_number       VARCHAR(100) NULL,
    address                   VARCHAR(255) NULL,
    city                      VARCHAR(100) NULL,
    state                     VARCHAR(100) NULL,
    pincode                   VARCHAR(20) NULL,
    location_lat              DECIMAL(10, 8) NULL,
    location_lng              DECIMAL(11, 8) NULL,
    contact_number            VARCHAR(20) NULL,
    is_verified               BOOLEAN DEFAULT FALSE,
    blood_bank_capacity       INT NULL,
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Organizations Table (NGOs, Colleges, Corporate Partners)
CREATE TABLE IF NOT EXISTS organizations (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL UNIQUE,
    name                VARCHAR(150) NOT NULL,
    org_type            ENUM('ngo', 'college', 'corporate', 'community') NOT NULL,
    registration_number VARCHAR(100) NULL,
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100) NULL,
    contact_person      VARCHAR(100) NULL,
    contact_phone       VARCHAR(20) NULL,
    is_verified         BOOLEAN DEFAULT FALSE,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Blood Banks & Inventory Table
CREATE TABLE IF NOT EXISTS blood_banks (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    hospital_profile_id INT NULL,
    name                VARCHAR(150) NOT NULL,
    address             VARCHAR(255) NULL,
    city                VARCHAR(100) NOT NULL,
    state               VARCHAR(100) NULL,
    pincode             VARCHAR(20) NULL,
    location_lat        DECIMAL(10, 8) NULL,
    location_lng        DECIMAL(11, 8) NULL,
    contact_number      VARCHAR(20) NULL,
    units_available     JSON NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_profile_id) REFERENCES hospital_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_blood_banks_location ON blood_banks(location_lat, location_lng);

-- 10. Emergency Blood Requests Table
CREATE TABLE IF NOT EXISTS blood_requests (
    id                       INT AUTO_INCREMENT PRIMARY KEY,
    request_id               VARCHAR(50) NOT NULL UNIQUE,
    requester_id             INT NOT NULL,
    hospital_profile_id      INT NULL,
    patient_name             VARCHAR(100) NOT NULL,
    blood_group              ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_required           INT NOT NULL CHECK (units_required BETWEEN 1 AND 10),
    units_fulfilled          INT DEFAULT 0,
    emergency_level          ENUM('critical', 'high', 'medium', 'low') NOT NULL,
    hospital_name            VARCHAR(150) NOT NULL,
    hospital_address         VARCHAR(255) NULL,
    hospital_city            VARCHAR(100) NOT NULL,
    hospital_state           VARCHAR(100) NULL,
    hospital_pincode         VARCHAR(20) NULL,
    hospital_lat             DECIMAL(10, 8) NULL,
    hospital_lng             DECIMAL(11, 8) NULL,
    hospital_contact_number  VARCHAR(20) NULL,
    status                   ENUM('pending', 'searching', 'donor_found', 'in_transit', 'at_hospital', 'completed', 'cancelled', 'expired') DEFAULT 'pending',
    expires_at               DATETIME NOT NULL,
    notes                    TEXT NULL,
    is_anonymous             BOOLEAN DEFAULT FALSE,
    report_url               VARCHAR(255) NULL,
    report_key               VARCHAR(255) NULL,
    ai_fake_score            DECIMAL(5, 2) NULL,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_profile_id) REFERENCES hospital_profiles(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX idx_blood_requests_emergency ON blood_requests(emergency_level, status);

-- 11. Request Responses Ledger Table
CREATE TABLE IF NOT EXISTS request_responses (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    request_id   INT NOT NULL,
    donor_id     INT NOT NULL,
    units        INT DEFAULT 1,
    status       ENUM('pending', 'accepted', 'declined', 'donated', 'no_response') DEFAULT 'pending',
    distance_km  DECIMAL(10, 2) NULL,
    eta_minutes  INT NULL,
    match_score  DECIMAL(6, 2) NULL,
    accepted_at  DATETIME NULL,
    responded_at DATETIME NULL,
    donated_at   DATETIME NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    UNIQUE (request_id, donor_id)
) ENGINE=InnoDB;

CREATE INDEX idx_request_responses_donor ON request_responses(donor_id, status);

-- 12. Durable Donation History Table
CREATE TABLE IF NOT EXISTS donation_history (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    donor_id        INT NOT NULL,
    request_id      INT NULL,
    donation_date   DATE NOT NULL,
    units           INT DEFAULT 1,
    hospital_name   VARCHAR(150) NULL,
    hospital_city   VARCHAR(100) NULL,
    certificate_url VARCHAR(255) NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Digital Verified Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id      VARCHAR(50) NOT NULL UNIQUE,
    donor_id            INT NOT NULL,
    donation_history_id INT NULL,
    qr_code_hash        VARCHAR(255) NOT NULL,
    pdf_url             VARCHAR(255) NULL,
    issued_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (donation_history_id) REFERENCES donation_history(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Badges Lookup Table
CREATE TABLE IF NOT EXISTS badges (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    description   VARCHAR(255) NULL,
    icon          VARCHAR(100) NULL,
    criteria_type VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 15. Donor Earned Badges Table
CREATE TABLE IF NOT EXISTS donor_badges (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    donor_id  INT NOT NULL,
    badge_id  INT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    UNIQUE (donor_id, badge_id)
) ENGINE=InnoDB;

-- 16. Donation Camps Table
CREATE TABLE IF NOT EXISTS donation_camps (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    organizer_user_id  INT NOT NULL,
    organization_id    INT NULL,
    title              VARCHAR(150) NOT NULL,
    description        TEXT NULL,
    location_name      VARCHAR(255) NOT NULL,
    address            VARCHAR(255) NULL,
    city               VARCHAR(100) NOT NULL,
    state              VARCHAR(100) NULL,
    location_lat       DECIMAL(10, 8) NULL,
    location_lng       DECIMAL(11, 8) NULL,
    start_time         DATETIME NOT NULL,
    end_time           DATETIME NOT NULL,
    status             ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    target_units       INT DEFAULT 50,
    collected_units    INT DEFAULT 0,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_donation_camps_city ON donation_camps(city, status);

-- 17. In-App Direct Messages / Chat Log Table
CREATE TABLE IF NOT EXISTS chats (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    request_id  INT NOT NULL,
    sender_id   INT NOT NULL,
    receiver_id INT NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    type         VARCHAR(50) NOT NULL,
    title        VARCHAR(150) NOT NULL,
    body         TEXT NOT NULL,
    data         JSON NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    read_at      DATETIME NULL,
    priority     ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);

-- 19. Request Timelines Audit Table
CREATE TABLE IF NOT EXISTS request_timelines (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    status     VARCHAR(50) NOT NULL,
    note       TEXT NULL,
    updated_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 20. OTP Security Logs Table
CREATE TABLE IF NOT EXISTS otp_logs (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NULL,
    email         VARCHAR(150) NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    purpose       ENUM('login', 'signup', 'email_verify', 'password_reset') NOT NULL,
    expires_at    DATETIME NOT NULL,
    consumed_at   DATETIME NULL,
    attempt_count INT DEFAULT 0,
    ip_address    VARCHAR(45) NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_otp_logs_email ON otp_logs(email, purpose, expires_at);

-- 21. User Trust Scores & Analytics
CREATE TABLE IF NOT EXISTS trust_scores (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL UNIQUE,
    trust_score        DECIMAL(5, 2) DEFAULT 100.00,
    verified_donations INT DEFAULT 0,
    report_accuracy    DECIMAL(5, 2) DEFAULT 100.00,
    risk_flag_count    INT DEFAULT 0,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 22-25. Security & Observability Audit Tables
CREATE TABLE IF NOT EXISTS activity_logs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id   INT NULL,
    metadata    JSON NULL,
    ip_address  VARCHAR(45) NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id  INT NULL,
    action         VARCHAR(100) NOT NULL,
    entity_type    VARCHAR(50) NOT NULL,
    entity_id      INT NULL,
    before_data    JSON NULL,
    after_data     JSON NULL,
    ip_address     VARCHAR(45) NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS analytics_daily (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    metric_date         DATE NOT NULL UNIQUE,
    total_donations     INT DEFAULT 0,
    active_requests     INT DEFAULT 0,
    fulfilled_requests  INT DEFAULT 0,
    active_donors       INT DEFAULT 0,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed Idempotent Roles
INSERT INTO roles (name, description) VALUES
    ('donor', 'Can respond to blood requests and donate'),
    ('patient', 'Can create blood requests for themselves or a dependent'),
    ('hospital', 'Verified hospital/blood bank account'),
    ('admin', 'Platform administrator'),
    ('volunteer', 'Verified event & camp coordinator'),
    ('organization', 'NGO / Corporate / College partner account')
ON DUPLICATE KEY UPDATE description = VALUES(description);
