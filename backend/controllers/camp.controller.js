/**
 * Camp Controller — HTTP request handlers for Blood Drive management (RedDrop AI V2)
 * Route: /api/v2/camps
 */
const ResponseUtil = require('../utils/response');

// TODO: inject CampService and CampMapper
// const campService = require('../services/camp.service');
// const campMapper = require('../mappers/camp.mapper');

module.exports = {
  // GET /api/v2/camps
  list: async (req, res, next) => {
    try {
      // const camps = await campService.list(req.query);
      return ResponseUtil.success(res, { message: 'Camps retrieved successfully.', data: [] });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v2/camps
  create: async (req, res, next) => {
    try {
      // const camp = await campService.create(req.body);
      return ResponseUtil.success(res, { code: 201, message: 'Camp created successfully.', data: {} });
    } catch (err) {
      next(err);
    }
  }
};
