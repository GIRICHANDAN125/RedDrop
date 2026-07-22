-- =====================================================================
-- RedDrop AI — V1 → V2 Data Migration
-- =====================================================================
-- Assumes:
--   * V1 database `reddropai` exists (source, untouched, read-only here)
--   * V2 database `reddropai_v2` exists with schema_v2.sql already applied
--     and `roles` already seeded (donor=1, patient=2, hospital=3, admin=4
--     per schema_v2.sql's INSERT order — re-checked defensively below
--     instead of hardcoded, in case roles were seeded in a different order)
--
-- Primary keys are preserved 1:1 wherever the source row maps to exactly
-- one destination row (users, donor_profiles via donors, blood_requests,
-- request_responses via assigned_donors, notifications, request_timelines)
-- so foreign keys copy across without any ID-remapping step.
--
-- Run as: mysql < migration_v1_to_v2.sql
-- Idempotent-ish: re-running is safe for the INSERT..SELECT steps because
-- each targets an empty destination table on a fresh reddropai_v2; it is
-- NOT safe to re-run against a reddropai_v2 that already has independently
-- created rows, since PK collisions will error rather than silently skip.
-- =====================================================================

USE reddropai_v2;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. users — auth core only. Password is copied across so existing V1
--    accounts can still log in with their existing password until
--    Phase 2 flips auth to OTP-only and drops this column.
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.users
    (id, email, email_verified, password, is_active, fcm_token, last_seen, created_at, updated_at)
SELECT
    id, email, is_verified, password, is_active, fcm_token, last_seen, created_at, updated_at
FROM reddropai.users;

-- ---------------------------------------------------------------------
-- 2. user_roles — map V1's single `role` enum onto the new roles table.
--    V1's 'receiver' becomes V2's 'patient'.
-- ---------------------------------------------------------------------
-- NOTE: reddropai (V1) and reddropai_v2 use different default collations
-- (utf8mb4_general_ci vs utf8mb4_unicode_ci). Any string comparison across
-- the two databases must force a common collation explicitly or MySQL
-- throws "Illegal mix of collations" — cast both sides here.
INSERT INTO reddropai_v2.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM reddropai.users u
JOIN reddropai_v2.roles r
    ON r.name = CONVERT(CASE u.role WHEN 'receiver' THEN 'patient' ELSE u.role END USING utf8mb4) COLLATE utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. user_profiles — the profile fields that used to sit on users
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.user_profiles
    (id, user_id, name, phone, blood_group, avatar_url, avatar_public_id,
     address, city, state, pincode, location_lat, location_lng,
     is_profile_complete, created_at, updated_at)
SELECT
    id, id, name, phone, blood_group, avatar_url, avatar_public_id,
    address, city, state, pincode, location_lat, location_lng,
    -- V1 had no explicit "profile complete" flag on users; approximate it
    -- as "has at least a name and phone", which every V1 user has since
    -- both were required at signup.
    TRUE, created_at, updated_at
FROM reddropai.users;

-- ---------------------------------------------------------------------
-- 4. donor_profiles — from V1's `donors` table. Emergency contact fields
--    lived on `donors` in V1; they belong on user_profiles in V2, so they
--    are copied there too (only when not already set).
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.donor_profiles
    (id, user_id, is_available, last_donation_date, hemoglobin_level, weight, age,
     has_chronic_disease, is_fit_to_donate, total_donations, lives_saved,
     requests_accepted, requests_declined, response_rate, is_verified,
     preferred_contact_method, max_distance_km, created_at, updated_at)
SELECT
    id, user_id, is_available, last_donation_date, hemoglobin_level, weight, age,
    has_chronic_disease, is_fit_to_donate, total_donations, lives_saved,
    requests_accepted, requests_declined, response_rate, is_verified,
    preferred_contact_method, max_distance_km, created_at, updated_at
FROM reddropai.donors;

UPDATE reddropai_v2.user_profiles up
JOIN reddropai.donors d ON d.user_id = up.user_id
SET up.emergency_contact_name     = d.emergency_contact_name,
    up.emergency_contact_phone    = d.emergency_contact_phone,
    up.emergency_contact_relation = d.emergency_contact_relation
WHERE d.emergency_contact_name IS NOT NULL;

-- ---------------------------------------------------------------------
-- 5. hospital_profiles — V1 had no dedicated hospital table; users with
--    role='hospital' only had their org name in `users.name`. Create a
--    minimal, clearly-unverified hospital_profiles row per such user so
--    nothing is silently dropped; a real admin should review and enrich
--    these (address/registration number/etc. were never collected in V1).
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.hospital_profiles
    (user_id, hospital_name, address, city, state, pincode,
     location_lat, location_lng, contact_number, is_verified, created_at, updated_at)
SELECT
    id, name, address, city, state, pincode,
    location_lat, location_lng, phone, FALSE, created_at, updated_at
FROM reddropai.users
WHERE role = 'hospital';

-- ---------------------------------------------------------------------
-- 6. patient_profiles — one per V1 user with role='receiver'
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.patient_profiles (user_id, created_at, updated_at)
SELECT id, created_at, updated_at
FROM reddropai.users
WHERE role = 'receiver';

-- ---------------------------------------------------------------------
-- 7. blood_requests — direct copy, PK preserved
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.blood_requests
    (id, request_id, requester_id, patient_name, blood_group, units_required,
     units_fulfilled, emergency_level, hospital_name, hospital_address,
     hospital_city, hospital_state, hospital_pincode, hospital_lat, hospital_lng,
     hospital_contact_number, status, expires_at, notes, is_anonymous,
     created_at, updated_at)
SELECT
    id, request_id, requester_id, patient_name, blood_group, units_required,
    units_fulfilled, emergency_level, hospital_name, hospital_address,
    hospital_city, hospital_state, hospital_pincode, hospital_lat, hospital_lng,
    hospital_contact_number, status, expires_at, notes, is_anonymous,
    created_at, updated_at
FROM reddropai.blood_requests;

-- ---------------------------------------------------------------------
-- 8. request_responses — from V1's `assigned_donors`, PK preserved
--    (donor_id in V1 already pointed at donors.id, which now shares the
--    same id-space as donor_profiles.id since step 4 preserved PKs)
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.request_responses
    (id, request_id, donor_id, units, status, distance_km, eta_minutes,
     accepted_at, donated_at, created_at, updated_at)
SELECT
    id, request_id, donor_id, units, status, distance, eta_minutes,
    accepted_at, donated_at, created_at, updated_at
FROM reddropai.assigned_donors;

-- ---------------------------------------------------------------------
-- 9. donation_history — derive one ledger row per completed donation
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.donation_history
    (donor_id, request_id, donation_date, units, hospital_name, hospital_city, created_at)
SELECT
    ad.donor_id, ad.request_id, DATE(ad.donated_at), ad.units,
    br.hospital_name, br.hospital_city, ad.donated_at
FROM reddropai.assigned_donors ad
JOIN reddropai.blood_requests br ON br.id = ad.request_id
WHERE ad.status = 'donated' AND ad.donated_at IS NOT NULL;

-- ---------------------------------------------------------------------
-- 10. notifications — direct copy, PK preserved
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.notifications
    (id, recipient_id, type, title, body, data, is_read, read_at, priority, created_at)
SELECT
    id, recipient_id, type, title, body, data, is_read, read_at, priority, created_at
FROM reddropai.notifications;

-- ---------------------------------------------------------------------
-- 11. request_timelines — direct copy, PK preserved
-- ---------------------------------------------------------------------
INSERT INTO reddropai_v2.request_timelines
    (id, request_id, status, note, updated_by, created_at)
SELECT
    id, request_id, status, note, updated_by, created_at
FROM reddropai.request_timelines;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 12. Sync AUTO_INCREMENT counters so future inserts don't collide with
--     the migrated IDs.
-- ---------------------------------------------------------------------
SET @next_users := (SELECT MAX(id) + 1 FROM users);
SET @sql := CONCAT('ALTER TABLE users AUTO_INCREMENT = ', @next_users);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_dp := (SELECT MAX(id) + 1 FROM donor_profiles);
SET @sql := CONCAT('ALTER TABLE donor_profiles AUTO_INCREMENT = ', @next_dp);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_br := (SELECT MAX(id) + 1 FROM blood_requests);
SET @sql := CONCAT('ALTER TABLE blood_requests AUTO_INCREMENT = ', @next_br);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_rr := (SELECT MAX(id) + 1 FROM request_responses);
SET @sql := CONCAT('ALTER TABLE request_responses AUTO_INCREMENT = ', @next_rr);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_notif := (SELECT MAX(id) + 1 FROM notifications);
SET @sql := CONCAT('ALTER TABLE notifications AUTO_INCREMENT = ', @next_notif);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @next_rt := (SELECT MAX(id) + 1 FROM request_timelines);
SET @sql := CONCAT('ALTER TABLE request_timelines AUTO_INCREMENT = ', @next_rt);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 13. Verification query — run manually after migrating, row counts on
--     both sides should reconcile (see MIGRATION_NOTES.md for the exact
--     expected relationships).
-- ---------------------------------------------------------------------
SELECT 'users'              AS table_name, (SELECT COUNT(*) FROM reddropai.users)             AS v1_count, (SELECT COUNT(*) FROM users)              AS v2_count
UNION ALL
SELECT 'donors->donor_profiles', (SELECT COUNT(*) FROM reddropai.donors)                       , (SELECT COUNT(*) FROM donor_profiles)
UNION ALL
SELECT 'blood_requests',    (SELECT COUNT(*) FROM reddropai.blood_requests)                    , (SELECT COUNT(*) FROM blood_requests)
UNION ALL
SELECT 'assigned_donors->request_responses', (SELECT COUNT(*) FROM reddropai.assigned_donors)  , (SELECT COUNT(*) FROM request_responses)
UNION ALL
SELECT 'notifications',     (SELECT COUNT(*) FROM reddropai.notifications)                     , (SELECT COUNT(*) FROM notifications)
UNION ALL
SELECT 'request_timelines', (SELECT COUNT(*) FROM reddropai.request_timelines)                 , (SELECT COUNT(*) FROM request_timelines);
