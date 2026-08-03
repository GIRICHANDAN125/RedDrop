/**
 * Request Validator — express-validator chains for blood request endpoints (RedDrop AI V2)
 */
const { body } = require('express-validator');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const EMERGENCY_LEVELS = ['critical', 'urgent', 'normal'];

const validateCreateRequest = [
  body('bloodGroup').isIn(BLOOD_GROUPS).withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}.`),
  body('unitsNeeded').isInt({ min: 1 }).withMessage('Units needed must be a positive integer.'),
  body('emergencyLevel').isIn(EMERGENCY_LEVELS).withMessage(`Emergency level must be one of: ${EMERGENCY_LEVELS.join(', ')}.`),
  body('hospitalId').isInt({ min: 1 }).withMessage('A valid hospital ID is required.'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters.')
];

module.exports = { validateCreateRequest };
