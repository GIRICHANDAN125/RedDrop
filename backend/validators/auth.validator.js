/**
 * Auth Validator — express-validator chains for authentication endpoints (RedDrop AI V2)
 */
const { body } = require('express-validator');

const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('A valid 10-digit Indian mobile number is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(['donor', 'patient', 'hospital', 'organization']).withMessage('Invalid role specified.')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('password').notEmpty().withMessage('Password is required.')
];

const validateVerifyOtp = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required.'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit numeric code.')
];

module.exports = { validateRegister, validateLogin, validateVerifyOtp };
