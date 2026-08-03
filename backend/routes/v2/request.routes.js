/**
 * V2 Request Routes — /api/v2/requests
 * RedDrop AI V2 Blood Request lifecycle endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire request controller, validators, and auth middleware
// const requestController = require('../../controllers/request.controller');
// const { validateCreateRequest } = require('../../validators/request.validator');
// const validate = require('../../middleware/validate.middleware');
// const { authenticate, authorize } = require('../../middleware/auth.middleware');

// POST /api/v2/requests
// router.post('/', authenticate, authorize('patient', 'hospital', 'admin'), validateCreateRequest, validate, requestController.create);

// GET /api/v2/requests/:id
// router.get('/:id', authenticate, requestController.getById);

// PATCH /api/v2/requests/:id/status
// router.patch('/:id/status', authenticate, authorize('donor', 'hospital', 'admin'), requestController.updateStatus);

module.exports = router;
