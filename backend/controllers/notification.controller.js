/**
 * Notification Controller — HTTP request handlers for notification management (RedDrop AI V2)
 * Route: /api/v2/notifications
 */
const ResponseUtil = require('../utils/response');

// TODO: inject NotificationService
// const notificationService = require('../services/notification.service');

module.exports = {
  // GET /api/v2/notifications (user's notifications)
  list: async (req, res, next) => {
    try {
      // const notifications = await notificationService.listForUser(req.user.id, req.query);
      return ResponseUtil.success(res, { message: 'Notifications retrieved successfully.', data: [] });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/v2/notifications/:id/read
  markRead: async (req, res, next) => {
    try {
      // await notificationService.markAsRead(req.params.id, req.user.id);
      return ResponseUtil.success(res, { message: 'Notification marked as read.' });
    } catch (err) {
      next(err);
    }
  }
};
