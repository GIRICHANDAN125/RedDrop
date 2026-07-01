const Notification = require('../models/Notification.model');
const { emitToUser } = require('../config/socket');

exports.createNotification = async (userId, data) => {
  try {
    const notification = await Notification.create({
      recipient: userId,
      ...data
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
  const emoji = emergencyEmojis[request.emergencyLevel] || '🩸';

  const notifications = donors.map(donor =>
    exports.createNotification(donor.user._id || donor.user, {
      type: 'blood_request_nearby',
      title: `${emoji} ${request.emergencyLevel.toUpperCase()} Blood Request Nearby`,
      body: `${request.bloodGroup} blood needed at ${request.hospital.name}, ${request.hospital.city}`,
      priority: request.emergencyLevel === 'critical' ? 'critical' : 'high',
      data: {
        requestId: request._id,
        bloodGroup: request.bloodGroup,
        hospital: request.hospital.name,
        unitsRequired: request.unitsRequired
      }
    })
  );

  await Promise.allSettled(notifications);
};

exports.getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  return { notifications, unreadCount };
};

exports.markAsRead = async (userId, notificationIds) => {
  await Notification.updateMany(
    { _id: { $in: notificationIds }, recipient: userId },
    { isRead: true, readAt: new Date() }
  );
};

exports.markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};
