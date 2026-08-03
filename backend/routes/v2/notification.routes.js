/**
 * V2 Notification Routes — /api/v2/notifications
 * RedDrop AI V2 Notification management endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire notification controller and auth middleware
// const notificationController = require('../../controllers/notification.controller');
// const { authenticate } = require('../../middleware/auth.middleware');

// GET /api/v2/notifications
// router.get('/', authenticate, notificationController.list);

// PATCH /api/v2/notifications/:id/read
// router.patch('/:id/read', authenticate, notificationController.markRead);

module.exports = router;
