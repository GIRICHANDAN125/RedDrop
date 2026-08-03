/**
 * Donor Validator — express-validator chains for donor management endpoints (RedDrop AI V2)
 */
const { body, query } = require('express-validator');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const validateUpdateDonor = [
  body('bloodGroup').isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}.`),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean.'),
  body('lastDonatedAt').optional().isISO8601().withMessage('lastDonatedAt must be a valid ISO 8601 date.')
];

const validateNearbySearch = [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required.'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required.'),
  query('radius').optional().isFloat({ min: 1, max: 200 }).withMessage('Radius must be between 1 and 200 km.'),
  query('bloodGroup').optional().isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}.`)
];

module.exports = { validateUpdateDonor, validateNearbySearch };
