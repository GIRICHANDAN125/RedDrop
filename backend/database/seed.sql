USE reddrop_ai;

-- 1. Insert Demo Users (Passwords are 'password123' hashed with bcrypt)
-- Note: Replace the hash with your actual bcrypt hash for 'password123' if testing auth.
-- Using a standard bcrypt hash for 'password123': $2a$12$K6y/J2X8.bN93h99Z5jS/OOnH70m59e19G1wIeG/i7Jz1L3L89UOC
INSERT INTO users (name, email, phone, password, role, blood_group, is_verified, is_active, location_lat, location_lng, city) VALUES 
('System Admin', 'admin@reddropai.com', '9876543210', '$2a$12$K6y/J2X8.bN93h99Z5jS/OOnH70m59e19G1wIeG/i7Jz1L3L89UOC', 'admin', NULL, TRUE, TRUE, NULL, NULL, 'Mumbai'),
('John Doe', 'john.donor@example.com', '9876543211', '$2a$12$K6y/J2X8.bN93h99Z5jS/OOnH70m59e19G1wIeG/i7Jz1L3L89UOC', 'donor', 'O+', TRUE, TRUE, 19.0760, 72.8777, 'Mumbai'),
('Jane Smith', 'jane.receiver@example.com', '9876543212', '$2a$12$K6y/J2X8.bN93h99Z5jS/OOnH70m59e19G1wIeG/i7Jz1L3L89UOC', 'receiver', NULL, TRUE, TRUE, 19.0760, 72.8777, 'Mumbai'),
('City Hospital', 'contact@cityhospital.com', '9876543213', '$2a$12$K6y/J2X8.bN93h99Z5jS/OOnH70m59e19G1wIeG/i7Jz1L3L89UOC', 'hospital', NULL, TRUE, TRUE, 19.0760, 72.8777, 'Mumbai');

-- 2. Insert Demo Donors (Linked to John Doe - User ID 2)
INSERT INTO donors (user_id, is_available, hemoglobin_level, weight, age, total_donations, is_profile_complete) VALUES 
(2, TRUE, 14.5, 75.0, 28, 5, TRUE);

-- 3. Insert Demo Requests (Linked to Jane Smith - User ID 3)
INSERT INTO blood_requests (request_id, requester_id, patient_name, blood_group, units_required, emergency_level, hospital_name, hospital_city, status, expires_at) VALUES 
('RD12345ABC', 3, 'Robert Smith', 'O+', 2, 'high', 'City Hospital', 'Mumbai', 'pending', DATE_ADD(NOW(), INTERVAL 72 HOUR));

-- 4. Insert Demo Assigned Donors (John Doe assigned to Jane Smith's request)
INSERT INTO assigned_donors (request_id, donor_id, units, status, distance, eta_minutes) VALUES 
(1, 1, 1, 'pending', 5.2, 15);

-- 5. Insert Demo Notifications
INSERT INTO notifications (recipient_id, type, title, body) VALUES 
(2, 'blood_request_nearby', 'Urgent O+ Blood Required', 'A patient at City Hospital needs 2 units of O+ blood.'),
(3, 'system', 'Welcome to RedDrop AI', 'Your account has been successfully created.');
