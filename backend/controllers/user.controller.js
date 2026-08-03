/**
 * User Controller — HTTP request handlers for user account & role management (RedDrop AI V2)
 * Route: /api/v2/users
 */
const ResponseUtil = require('../utils/response');

// TODO: inject UserService and UserMapper
// const userService = require('../services/user.service');
// const userMapper = require('../mappers/user.mapper');

module.exports = {
  // GET /api/v2/users/me
  getProfile: async (req, res, next) => {
    try {
      // const user = await userService.getById(req.user.id);
      return ResponseUtil.success(res, { message: 'User profile retrieved.', data: {} });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/v2/users/me
  updateProfile: async (req, res, next) => {
    try {
      // const updated = await userService.update(req.user.id, req.body);
      return ResponseUtil.success(res, { message: 'Profile updated successfully.', data: {} });
    } catch (err) {
      next(err);
    }
  }
};
