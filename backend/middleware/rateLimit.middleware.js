/**
 * Rate Limiting Middleware for RedDrop AI V2
 * Exports two limiters: general API (100/15min) and strict auth (5/15min).
 */
const rateLimit = require('express-rate-limit');
const ResponseUtil = require('../utils/response');

/** General API rate limiter — 100 requests per 15-minute window per IP */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) =>
    ResponseUtil.error(res, {
      code: 429,
      type: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    })
});

/** Strict auth rate limiter — 5 requests per 15-minute window per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) =>
    ResponseUtil.error(res, {
      code: 429,
      type: 'TOO_MANY_REQUESTS',
      message: 'Too many auth attempts. Please wait 15 minutes before retrying.'
    })
});

module.exports = { apiLimiter, authLimiter };
