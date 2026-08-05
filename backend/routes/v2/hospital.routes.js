const express = require('express');
const router = express.Router();
const hospitalController = require('../../controllers/hospital.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/hospitals/blood-banks — must be before /:id
router.get('/blood-banks', hospitalController.listBloodBanks);

// GET /api/v2/hospitals/dashboard
router.get('/dashboard', authenticate, hospitalController.getDashboard);

// GET /api/v2/hospitals
router.get('/', hospitalController.list);

// GET /api/v2/hospitals/inventory
router.get('/inventory', authenticate, hospitalController.getInventory);

// PUT /api/v2/hospitals/inventory
router.put('/inventory', authenticate, authorize('hospital', 'admin'), hospitalController.updateInventory);

module.exports = router;
