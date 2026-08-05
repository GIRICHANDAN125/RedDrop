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
  },

  // POST /api/v2/camps/:id/register
  register: async (req, res, next) => {
    try {
      const result = await campService.registerForCamp(req.params.id, req.user.id);
      const code = result.registration.alreadyRegistered ? 200 : 201;
      const message = result.registration.alreadyRegistered
        ? 'You are already registered for this camp.'
        : 'Successfully registered for the donation camp!';
      return ResponseUtil.success(res, { code, message, data: result });
    } catch (err) {
      Logger.error('Camp registration error', { campId: req.params.id, userId: req.user?.id, error: err.message });
      next(err);
    }
  },

  // POST /api/v2/camps/:id/checkin
  checkIn: async (req, res, next) => {
    try {
      const { qrToken } = req.body;
      if (!qrToken) {
        return ResponseUtil.error(res, { code: 400, type: 'VALIDATION_ERROR', message: 'QR token is required.' });
      }
      const result = await campService.checkIn(qrToken);
      return ResponseUtil.success(res, {
        message: result.alreadyCheckedIn ? 'Already checked in.' : 'Check-in successful!',
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v2/camps/:id/registrations
  getCampRegistrations: async (req, res, next) => {
    try {
      const registrations = await campService.getCampRegistrations(req.params.id);
      return ResponseUtil.success(res, { message: 'Camp registrations retrieved.', data: registrations });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v2/camps/my/registrations
  getMyRegistrations: async (req, res, next) => {
    try {
      const registrations = await campService.getMyRegistrations(req.user.id);
      return ResponseUtil.success(res, { message: 'Your camp registrations retrieved.', data: registrations });
    } catch (err) {
      next(err);
    }
  }
};
