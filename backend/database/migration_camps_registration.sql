-- =====================================================================
-- RedDrop AI V2 — Camp Registrations & Volunteer Tables Migration
-- Run once after schema_v2.sql
-- =====================================================================

USE reddropai_v2;

-- Camp Registrations Table
CREATE TABLE IF NOT EXISTS camp_registrations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    camp_id     INT NOT NULL,
    user_id     INT NOT NULL,
    status      ENUM('registered', 'checked_in', 'donated', 'cancelled') DEFAULT 'registered',
    qr_token    VARCHAR(255) NOT NULL UNIQUE,
    checked_in_at DATETIME NULL,
    donated_at  DATETIME NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (camp_id) REFERENCES donation_camps(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (camp_id, user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_camp_reg_camp ON camp_registrations(camp_id, status);
CREATE INDEX idx_camp_reg_user ON camp_registrations(user_id);

-- Hospital Appointments Table
CREATE TABLE IF NOT EXISTS hospital_appointments (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id     INT NOT NULL,
    donor_user_id   INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status          ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    notes           TEXT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (donor_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_hospital_appt_date ON hospital_appointments(hospital_id, appointment_date, status);
