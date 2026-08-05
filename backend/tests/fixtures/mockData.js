/**
 * Mock Data Fixtures for RedDrop AI V2 Enterprise Testing
 */

const mockUsers = [
  {
    id: 1,
    name: 'John Donor',
    email: 'john.donor@example.com',
    phone: '+1234567890',
    role: 'donor',
    status: 'active',
    password: '$2a$10$e8wM.A4Z2E8z8M/6k.1.OOgV4jS1eY8K9O7L6M5N4P3Q2R1S0T9U8',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'City Hospital Admin',
    email: 'hospital@citymed.org',
    phone: '+1987654321',
    role: 'hospital',
    status: 'active',
    password: '$2a$10$e8wM.A4Z2E8z8M/6k.1.OOgV4jS1eY8K9O7L6M5N4P3Q2R1S0T9U8',
    created_at: new Date().toISOString()
  }
];

const mockDonorProfiles = [
  {
    id: 1,
    user_id: 1,
    blood_group: 'O+',
    is_available: true,
    latitude: 37.7749,
    longitude: -122.4194,
    last_donated_at: null,
    total_donations: 3
  }
];

const mockRequests = [
  {
    id: 1,
    patient_name: 'Jane Doe',
    hospital_name: 'City General Hospital',
    blood_group: 'O+',
    units_needed: 2,
    urgency_level: 'CRITICAL',
    status: 'PENDING',
    latitude: 37.7749,
    longitude: -122.4194,
    requester_id: 2,
    created_at: new Date().toISOString()
  }
];

const mockTokens = {
  validDonorToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockDonorPayload.signature',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockExpiredPayload.signature'
};

module.exports = {
  mockUsers,
  mockDonorProfiles,
  mockRequests,
  mockTokens
};
