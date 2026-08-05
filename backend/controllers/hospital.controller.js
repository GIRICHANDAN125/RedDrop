const ResponseUtil = require('../utils/response');
const hospitalService = require('../services/hospital.service');
const Logger = require('../utils/logger');

module.exports = {
  // GET /api/v2/hospitals/dashboard
  getDashboard: async (req, res, next) => {
    try {
      const data = await hospitalService.getDashboardData(req.user.id);
      return ResponseUtil.success(res, { message: 'Hospital dashboard data retrieved.', data });
    } catch (err) {
      Logger.error('Hospital dashboard fetch error', { userId: req.user?.id, error: err.message });
      next(err);
    }
  },

  // GET /api/v2/hospitals
  list: async (req, res, next) => {
    try {
      const hospitals = await hospitalService.listHospitals(req.query);
      return ResponseUtil.success(res, { message: 'Hospitals retrieved successfully.', data: hospitals });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v2/hospitals/blood-banks
  listBloodBanks: async (req, res, next) => {
    try {
      const banks = await hospitalService.listBloodBanks(req.query);
      return ResponseUtil.success(res, { message: 'Blood banks retrieved successfully.', data: banks });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v2/hospitals/inventory
  getInventory: async (req, res, next) => {
    try {
      const dashboard = await hospitalService.getDashboardData(req.user.id);
      return ResponseUtil.success(res, { message: 'Inventory retrieved successfully.', data: dashboard.inventory });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/v2/hospitals/inventory
  updateInventory: async (req, res, next) => {
    try {
      const result = await hospitalService.updateInventory(req.user.id, req.body);
      return ResponseUtil.success(res, { message: 'Hospital inventory updated successfully.', data: result });
    } catch (err) {
      next(err);
    }
  }
};
