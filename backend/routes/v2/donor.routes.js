/**
 * V2 Donor Routes — /api/v2/donors
 * RedDrop AI V2 Donor Search & Profile endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire donor controller, validators, and auth middleware
// const donorController = require('../../controllers/donor.controller');
// const { validateUpdateDonor, validateNearbySearch } = require('../../validators/donor.validator');
// const validate = require('../../middleware/validate.middleware');
// const { authenticate, optionalAuth } = require('../../middleware/auth.middleware');

// GET /api/v2/donors/nearby?latitude=&longitude=&radius=&bloodGroup=
// router.get('/nearby', optionalAuth, validateNearbySearch, validate, donorController.nearby);

// PATCH /api/v2/donors/me
// router.patch('/me', authenticate, validateUpdateDonor, validate, donorController.updateProfile);

module.exports = router;
