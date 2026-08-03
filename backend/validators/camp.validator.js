/**
 * Camp Validator — express-validator chains for blood donation camp endpoints (RedDrop AI V2)
 */
const { body } = require('express-validator');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const validateCreateCamp = [
  body('name').trim().notEmpty().withMessage('Camp name is required.'),
  body('city').trim().notEmpty().withMessage('City is required.'),
  body('address').trim().notEmpty().withMessage('Address is required.'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date (YYYY-MM-DD).'),
  body('startTime').notEmpty().withMessage('Start time is required.'),
  body('endTime').notEmpty().withMessage('End time is required.'),
  body('organizer').trim().notEmpty().withMessage('Organizer name is required.')
];

module.exports = { validateCreateCamp };
