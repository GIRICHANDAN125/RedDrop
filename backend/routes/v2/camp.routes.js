const express = require('express');
const router = express.Router();
const campController = require('../../controllers/camp.controller');
const { validateCreateCamp } = require('../../validators/camp.validator');
const validate = require('../../middleware/validate.middleware');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/camps/my/registrations — must be before /:id
router.get('/my/registrations', authenticate, campController.getMyRegistrations);

// GET /api/v2/camps
router.get('/', campController.list);

// GET /api/v2/camps/:id
router.get('/:id', campController.getById);

// POST /api/v2/camps
router.post('/', authenticate, validateCreateCamp, validate, campController.create);

// POST /api/v2/camps/:id/register
router.post('/:id/register', authenticate, campController.register);

// POST /api/v2/camps/:id/checkin
router.post('/:id/checkin', authenticate, authorize('hospital', 'volunteer', 'admin'), campController.checkIn);

// GET /api/v2/camps/:id/registrations
router.get('/:id/registrations', authenticate, authorize('hospital', 'volunteer', 'admin', 'organization'), campController.getCampRegistrations);

module.exports = router;
