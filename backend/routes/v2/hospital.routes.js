/**
 * V2 Hospital Routes — /api/v2/hospitals
 * RedDrop AI V2 Hospital Dashboard & Inventory endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire hospital controller and auth middleware
// const hospitalController = require('../../controllers/hospital.controller');
// const { authenticate, authorize } = require('../../middleware/auth.middleware');

// GET /api/v2/hospitals
// router.get('/', hospitalController.list);

// GET /api/v2/hospitals/:id/inventory
// router.get('/:id/inventory', authenticate, authorize('hospital', 'admin'), hospitalController.getInventory);

module.exports = router;
