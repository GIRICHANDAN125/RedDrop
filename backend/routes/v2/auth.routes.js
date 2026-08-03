/**
 * V2 Auth Routes — /api/v2/auth
 * RedDrop AI V2 Authentication & OTP endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire auth controller, validators, and rate limiter
// const authController = require('../../controllers/auth.controller');
// const { validateRegister, validateLogin, validateVerifyOtp } = require('../../validators/auth.validator');
// const validate = require('../../middleware/validate.middleware');
// const { authLimiter } = require('../../middleware/rateLimit.middleware');

// POST /api/v2/auth/register
// router.post('/register', authLimiter, validateRegister, validate, authController.register);

// POST /api/v2/auth/login
// router.post('/login', authLimiter, validateLogin, validate, authController.login);

// POST /api/v2/auth/verify-otp
// router.post('/verify-otp', authLimiter, validateVerifyOtp, validate, authController.verifyOtp);

// POST /api/v2/auth/refresh
// router.post('/refresh', authController.refreshToken);

module.exports = router;
