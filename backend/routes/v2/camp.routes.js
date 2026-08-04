const express = require('express');
const router = express.Router();
const campController = require('../../controllers/camp.controller');
const { validateCreateCamp } = require('../../validators/camp.validator');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/camps
router.get('/', campController.list);

// GET /api/v2/camps/:id
router.get('/:id', campController.getById);

// POST /api/v2/camps
router.post('/', authenticate, validateCreateCamp, validate, campController.create);

module.exports = router;
