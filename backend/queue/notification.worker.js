const QueueService = require('../services/queue.service');
const notificationService = require('../services/notification.service');
const Logger = require('../utils/logger');

/**
 * Notification Background Worker
 * Processes push & in-app notification jobs asynchronously.
 */
class NotificationWorker {
  static dispatchNotification(userId, data) {
    QueueService.enqueue('NOTIFICATION_DISPATCH', { userId, data }, async (payload) => {
      Logger.info(`Dispatching notification to user ${payload.userId}`);
      await notificationService.createNotification(payload.userId, payload.data);
    });
  }

  static notifyNearby(donors, request) {
    QueueService.enqueue('NEARBY_DONORS_NOTIFY', { donors, request }, async (payload) => {
      Logger.info(`Notifying ${payload.donors.length} nearby donors for request ${payload.request.id}`);
      await notificationService.notifyNearbyDonors(payload.donors, payload.request);
    });
  }
}

module.exports = NotificationWorker;
