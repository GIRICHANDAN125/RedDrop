/**
 * V2 Camp Routes — /api/v2/camps
 * RedDrop AI V2 Blood Donation Camp endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire camp controller, validators, and auth middleware
// const campController = require('../../controllers/camp.controller');
// const { validateCreateCamp } = require('../../validators/camp.validator');
// const validate = require('../../middleware/validate.middleware');
// const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/camps
// router.get('/', campController.list);

// POST /api/v2/camps
// router.post('/', authenticate, authorize('organization', 'hospital', 'admin'), validateCreateCamp, validate, campController.create);

module.exports = router;
