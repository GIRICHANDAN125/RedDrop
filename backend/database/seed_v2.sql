-- =====================================================================
-- RedDrop AI V2 — seed_v2.sql
-- For a FRESH install only (schema_v2.sql already seeds `roles` itself,
-- idempotently, so this file focuses on optional demo/dev data).
-- Do NOT run this against a production database.
--
-- NOTE ON THE ORIGINAL seed.sql: the V1 seed.sql opens with
-- `USE reddrop_ai;` while schema.sql creates database `reddropai`
-- (no underscore) — the two never actually matched, so V1's seed file
-- has likely never run successfully against a freshly-created V1 DB.
-- Flagging it here rather than silently fixing it, since it's not part
-- of this migration's job. V2 uses `reddropai_v2` consistently everywhere.
-- =====================================================================

USE reddropai_v2;

-- Roles are already seeded by schema_v2.sql. Re-asserted here defensively
-- in case this file is ever run standalone against an empty schema.
INSERT INTO roles (name, description) VALUES
    ('donor', 'Can respond to blood requests and donate'),
    ('patient', 'Can create blood requests for themselves or a dependent'),
    ('hospital', 'Verified hospital/blood bank account'),
    ('admin', 'Platform administrator')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- ---------------------------------------------------------------------
-- Demo users. password is intentionally NULL: OTP-only login ships in
-- Phase 2, and until then these accounts simply can't use the legacy
-- password endpoint — which is the desired behavior for seed data.
-- ---------------------------------------------------------------------
INSERT INTO users (email, email_verified, is_active) VALUES
    ('demo.donor@reddrop.ai', TRUE, TRUE),
    ('demo.patient@reddrop.ai', TRUE, TRUE),
    ('demo.hospital@reddrop.ai', TRUE, TRUE),
    ('demo.admin@reddrop.ai', TRUE, TRUE);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON
    (u.email = 'demo.donor@reddrop.ai' AND r.name = 'donor') OR
    (u.email = 'demo.patient@reddrop.ai' AND r.name = 'patient') OR
    (u.email = 'demo.hospital@reddrop.ai' AND r.name = 'hospital') OR
    (u.email = 'demo.admin@reddrop.ai' AND r.name = 'admin');

INSERT INTO user_profiles (user_id, name, phone, blood_group, city, state, is_profile_complete)
SELECT id, 'Demo Donor', '9000000001', 'O+', 'Mumbai', 'MH', TRUE FROM users WHERE email = 'demo.donor@reddrop.ai'
UNION ALL
SELECT id, 'Demo Patient', '9000000002', 'B+', 'Pune', 'MH', TRUE FROM users WHERE email = 'demo.patient@reddrop.ai';

INSERT INTO donor_profiles (user_id, is_available, total_donations, response_rate, is_verified)
SELECT id, TRUE, 5, 95.00, TRUE FROM users WHERE email = 'demo.donor@reddrop.ai';

INSERT INTO patient_profiles (user_id)
SELECT id FROM users WHERE email = 'demo.patient@reddrop.ai';

INSERT INTO hospital_profiles (user_id, hospital_name, city, state, is_verified)
SELECT id, 'Demo General Hospital', 'Mumbai', 'MH', TRUE FROM users WHERE email = 'demo.hospital@reddrop.ai';
