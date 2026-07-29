const notificationRepository = require('../repositories/notification.repository');
const { emitToUser } = require('../config/socket');

exports.createNotification = async (userId, data) => {
  try {
    const notification = await notificationRepository.createNotification({
      recipientId: userId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data || null,
      priority: data.priority || 'normal'
    });

    // Real-time push via socket
    emitToUser(userId.toString(), 'notification:new', notification);

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
  }
};

exports.notifyNearbyDonors = async (donors, request) => {
  const emergencyEmojis = { critical: '🚨', high: '❗', medium: '⚠️', low: 'ℹ️' };
  const emoji = emergencyEmojis[request.emergency_level] || '🩸';

  const notifications = donors.map(donor =>
    exports.createNotification(donor.user_id, {
      type: 'blood_request_nearby',
      title: `${emoji} ${request.emergency_level.toUpperCase()} Blood Request Nearby`,
      body: `${request.blood_group} blood needed at ${request.hospital_name}, ${request.hospital_city}`,
      priority: request.emergency_level === 'critical' ? 'critical' : 'high',
      data: {
        requestId: request.id,
        bloodGroup: request.blood_group,
        hospital: request.hospital_name,
        unitsRequired: request.units_required
      }
    })
  );

  await Promise.allSettled(notifications);
};

exports.getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const { notifications, total } = await notificationRepository.getForUser(userId, {
    page,
    limit,
    unreadOnly
  });
  return { notifications, unreadCount: unreadOnly ? total : null };
};

exports.markAsRead = async (userId, notificationIds) => {
  await notificationRepository.markAsRead(userId, notificationIds);
};

exports.markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
};
