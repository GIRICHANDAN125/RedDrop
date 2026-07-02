const { pool } = require('../config/database');
const { emitToUser } = require('../config/socket');

exports.createNotification = async (userId, data) => {
  try {
    const [result] = await pool.execute(
      'INSERT INTO notifications (recipient_id, type, title, body, data, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, data.type, data.title, data.body, data.data ? JSON.stringify(data.data) : null, data.priority || 'normal']
    );

    const [notifs] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
    const notification = notifs[0];

    if (notification.data) {
      notification.data = JSON.parse(notification.data);
    }

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
  let sql = 'SELECT * FROM notifications WHERE recipient_id = ?';
  let params = [userId];

  if (unreadOnly) {
    sql += ' AND is_read = 0';
  }

  const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
  const [countRows] = await pool.execute(countSql, params);
  const total = countRows[0].total;

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const limitInt = parseInt(limit);
  const offsetInt = (parseInt(page) - 1) * limitInt;
  params.push(limitInt.toString(), offsetInt.toString());

  const [notifications] = await pool.query(sql, params.map(p => Number.isNaN(Number(p)) ? p : Number(p)));

  notifications.forEach(n => {
    if (n.data) n.data = JSON.parse(n.data);
  });

  return { notifications, unreadCount: unreadOnly ? total : null }; // unreadCount calculation can be improved if needed
};

exports.markAsRead = async (userId, notificationIds) => {
  if (!notificationIds || notificationIds.length === 0) return;
  const placeholders = notificationIds.map(() => '?').join(',');
  await pool.query(
    `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE recipient_id = ? AND id IN (${placeholders})`,
    [userId, ...notificationIds]
  );
};

exports.markAllAsRead = async (userId) => {
  await pool.execute(
    'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE recipient_id = ? AND is_read = 0',
    [userId]
  );
};
