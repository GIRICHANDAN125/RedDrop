const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  /**
   * Create a notification and return the inserted row.
   */
  async createNotification({ recipientId, type, title, body, data = null, priority = 'normal' }) {
    const insertId = await this.create({
      recipient_id: recipientId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
      priority
    });
    const row = await this.findById(insertId);
    if (row && row.data && typeof row.data === 'string') {
      try { row.data = JSON.parse(row.data); } catch { /* keep as-is */ }
    }
    return row;
  }

  /**
   * Get paginated notifications for a user.
   */
  async getForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
    let sql = 'SELECT * FROM notifications WHERE recipient_id = ?';
    const params = [userId];

    if (unreadOnly) {
      sql += ' AND is_read = 0';
    }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const limitInt = parseInt(limit);
    const offsetInt = (parseInt(page) - 1) * limitInt;
    params.push(limitInt, offsetInt);

    const [notifications] = await pool.query(sql, params);
    notifications.forEach((n) => {
      if (n.data && typeof n.data === 'string') {
        try { n.data = JSON.parse(n.data); } catch { /* keep as-is */ }
      }
    });

    return { notifications, total };
  }

  /**
   * Get unread notification count for a user.
   */
  async getUnreadCount(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE recipient_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  }

  /**
   * Mark specific notifications as read for a user.
   */
  async markAsRead(userId, notificationIds) {
    if (!notificationIds || notificationIds.length === 0) return;
    const placeholders = notificationIds.map(() => '?').join(',');
    await pool.query(
      `UPDATE notifications SET is_read = 1, read_at = NOW()
       WHERE recipient_id = ? AND id IN (${placeholders})`,
      [userId, ...notificationIds]
    );
  }

  /**
   * Mark ALL notifications as read for a user.
   */
  async markAllAsRead(userId) {
    await pool.execute(
      'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE recipient_id = ? AND is_read = 0',
      [userId]
    );
  }
}

module.exports = new NotificationRepository();
