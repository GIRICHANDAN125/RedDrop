/**
 * Auth DTO — Input contract for authentication endpoints (RedDrop AI V2)
 * Used by validators to define accepted request body shapes.
 */

const registerDTO = {
  name: { type: 'string', required: true, minLength: 2 },
  email: { type: 'string', required: true, format: 'email' },
  phone: { type: 'string', required: true, pattern: '^[6-9]\\d{9}$' },
  password: { type: 'string', required: true, minLength: 8 },
  role: { type: 'string', enum: ['donor', 'patient', 'hospital', 'organization'] }
};

const loginDTO = {
  email: { type: 'string', required: true, format: 'email' },
  password: { type: 'string', required: true }
};

const verifyOtpDTO = {
  email: { type: 'string', required: true, format: 'email' },
  otp: { type: 'string', required: true, length: 6 }
};

module.exports = { registerDTO, loginDTO, verifyOtpDTO };
