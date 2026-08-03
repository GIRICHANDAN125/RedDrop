/**
 * express-validator Execution Guard for RedDrop AI V2
 * Run this middleware after validator chains to collect and return errors.
 */
const { validationResult } = require('express-validator');
const ResponseUtil = require('../utils/response');

/**
 * Middleware that reads express-validator results and returns
 * an RFC 7807 VALIDATION_ERROR envelope if any errors are present.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseUtil.error(res, {
      code: 400,
      type: 'VALIDATION_ERROR',
      message: 'Invalid request parameters.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

module.exports = validate;
