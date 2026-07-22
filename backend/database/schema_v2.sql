-- =====================================================================
-- RedDrop AI V2 — Normalized Production Schema
-- =====================================================================
-- Design notes (read before editing):
--   * `users` is auth-only: email, verification state, deprecated password
--     column (kept nullable through the OTP migration in Phase 2, then
--     dropped), timestamps. Nothing else lives here.
--   * All profile data lives in `user_profiles` (1:1 with users).
--   * Roles are no longer a single ENUM column. `roles` + `user_roles`
--     give every user zero or more roles, addable at any time
--     ("Become Donor" / "Become Patient" / "Become Hospital").
--   * Role-specific data lives in donor_profiles / patient_profiles /
--     hospital_profiles, each 1:1 with users, created on demand when a
--     role is added.
--   * request_responses replaces assigned_donors (renamed for clarity —
--     a "response" is a donor's response to a request, which may or may
--     not turn into a donation) and now stores the AI match_score.
--   * donation_history is a durable ledger, independent of
--     request_responses so a donor's history survives even if a request
--     row is later deleted.
--   * otp_logs / activity_logs / audit_logs / socket_sessions /
--     ai_matching_logs are new observability/security tables with no
--     V1 equivalent.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS reddropai_v2
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reddropai_v2;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- roles — fixed lookup table of assignable roles
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        ENUM('donor', 'patient', 'hospital', 'admin') NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- users — auth core ONLY
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(150) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    -- Deprecated: retained nullable only so Phase 1 can coexist with the
    -- still-password-based V1 auth controller. Dropped entirely in Phase 2
    -- once OTP-only login ships.
    password       VARCHAR(255) NULL,
    is_active      BOOLEAN DEFAULT TRUE,
    fcm_token      VARCHAR(255) NULL,
    last_seen      DATETIME NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_users_email ON users(email);

-- ---------------------------------------------------------------------
-- user_roles — many-to-many, one user can hold several roles at once
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- user_profiles — the "Complete Your Profile" data, 1:1 with users
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- donor_profiles — created when a user adds the "donor" role
-- ---------------------------------------------------------------------
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
    response_rate            DECIMAL(5, 2) DEFAULT 100,
    is_verified              BOOLEAN DEFAULT FALSE,
    preferred_contact_method ENUM('phone', 'app', 'both') DEFAULT 'both',
    max_distance_km          INT DEFAULT 20,
    created_at               DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at               DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_donor_profiles_available ON donor_profiles(is_available);

-- ---------------------------------------------------------------------
-- patient_profiles — created when a user adds the "patient" role
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_profiles (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    user_id             INT NOT NULL UNIQUE,
    primary_hospital_id INT NULL,
    medical_notes       TEXT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- hospital_profiles — created when a user adds the "hospital" role
-- ---------------------------------------------------------------------
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
    verification_document_url VARCHAR(255) NULL,
    verification_document_key VARCHAR(255) NULL,
    blood_bank_capacity       INT NULL,
    created_at                DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at                DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE patient_profiles
    ADD CONSTRAINT fk_patient_primary_hospital
    FOREIGN KEY (primary_hospital_id) REFERENCES hospital_profiles(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- blood_requests
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- request_responses — replaces assigned_donors; a donor's response to a
-- request (may or may not become a completed donation)
-- ---------------------------------------------------------------------
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
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
    UNIQUE (request_id, donor_id)
) ENGINE=InnoDB;

CREATE INDEX idx_request_responses_donor ON request_responses(donor_id, status);

-- ---------------------------------------------------------------------
-- donation_history — durable ledger, independent of request_responses
-- ---------------------------------------------------------------------
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

CREATE INDEX idx_donation_history_donor ON donation_history(donor_id, donation_date);

-- ---------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- request_timelines — preserved from V1 (tracking screen depends on it)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- otp_logs — every OTP issuance/consumption, for OTP-only auth (Phase 2)
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- activity_logs — lightweight user activity trail (non-security)
-- ---------------------------------------------------------------------
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

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id, created_at);

-- ---------------------------------------------------------------------
-- audit_logs — security-relevant before/after change trail
-- ---------------------------------------------------------------------
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

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ---------------------------------------------------------------------
-- socket_sessions — active Socket.io connection tracking
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS socket_sessions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    user_id         INT NOT NULL,
    socket_id       VARCHAR(100) NOT NULL,
    connected_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    disconnected_at DATETIME NULL,
    last_ping_at    DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_socket_sessions_user ON socket_sessions(user_id);
CREATE INDEX idx_socket_sessions_socket ON socket_sessions(socket_id);

-- ---------------------------------------------------------------------
-- ai_matching_logs — every candidate a request was scored against
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_matching_logs (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    request_id          INT NOT NULL,
    donor_id            INT NOT NULL,
    distance_score      DECIMAL(6, 2) NULL,
    compatibility_score DECIMAL(6, 2) NULL,
    availability_score  DECIMAL(6, 2) NULL,
    history_score       DECIMAL(6, 2) NULL,
    response_speed_score DECIMAL(6, 2) NULL,
    final_score         DECIMAL(6, 2) NOT NULL,
    rank_position        INT NULL,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_ai_matching_logs_request ON ai_matching_logs(request_id, final_score);

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- Seed the fixed role list (idempotent)
-- ---------------------------------------------------------------------
INSERT INTO roles (name, description) VALUES
    ('donor', 'Can respond to blood requests and donate'),
    ('patient', 'Can create blood requests for themselves or a dependent'),
    ('hospital', 'Verified hospital/blood bank account'),
    ('admin', 'Platform administrator')
ON DUPLICATE KEY UPDATE description = VALUES(description);
