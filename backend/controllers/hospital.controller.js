/**
 * Hospital Controller — HTTP request handlers for hospital dashboard & inventory (RedDrop AI V2)
 * Route: /api/v2/hospitals
 */
const ResponseUtil = require('../utils/response');

// TODO: inject HospitalService
// const hospitalService = require('../services/hospital.service');

module.exports = {
  // GET /api/v2/hospitals
  list: async (req, res, next) => {
    try {
      // const hospitals = await hospitalService.list(req.query);
      return ResponseUtil.success(res, { message: 'Hospitals retrieved successfully.', data: [] });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v2/hospitals/:id/inventory
  getInventory: async (req, res, next) => {
    try {
      // const inventory = await hospitalService.getInventory(req.params.id);
      return ResponseUtil.success(res, { message: 'Inventory retrieved successfully.', data: {} });
    } catch (err) {
      next(err);
    }
  }
};
