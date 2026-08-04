const ResponseUtil = require('../utils/response');
const campService = require('../services/camp.service');
const Logger = require('../utils/logger');

module.exports = {
  // GET /api/v2/camps
  list: async (req, res, next) => {
    try {
      const camps = await campService.listCamps(req.query);
      return ResponseUtil.success(res, { message: 'Donation camps retrieved successfully.', data: camps });
    } catch (err) {
      Logger.error('List camps error', { error: err.message });
      next(err);
    }
  },

  // GET /api/v2/camps/:id
  getById: async (req, res, next) => {
    try {
      const camp = await campService.getById(req.params.id);
      return ResponseUtil.success(res, { message: 'Camp details retrieved successfully.', data: camp });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v2/camps
  create: async (req, res, next) => {
    try {
      const camp = await campService.createCamp(req.user.id, req.body);
      return ResponseUtil.success(res, { code: 201, message: 'Donation camp created successfully.', data: camp });
    } catch (err) {
      Logger.error('Create camp error', { userId: req.user?.id, error: err.message });
      next(err);
    }
  }
};
