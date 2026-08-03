/**
 * V2 User Routes — /api/v2/users
 * RedDrop AI V2 User account & role management endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire user controller and auth middleware
// const userController = require('../../controllers/user.controller');
// const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/users/me
// router.get('/me', authenticate, userController.getProfile);

// PATCH /api/v2/users/me
// router.patch('/me', authenticate, userController.updateProfile);

// GET /api/v2/users (admin only)
// router.get('/', authenticate, authorize('admin'), userController.list);

module.exports = router;
