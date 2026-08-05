const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');
const crypto = require('crypto');

class CampRegistrationRepository extends BaseRepository {
  constructor() {
    super('camp_registrations');
  }

  /**
   * Register a user for a camp. Returns the new row or the existing one.
   */
  async registerUserForCamp(campId, userId) {
    // Check for existing registration
    const existing = await this.findExisting(campId, userId);
    if (existing) return { ...existing, alreadyRegistered: true };

    const qrToken = crypto.randomBytes(24).toString('hex');
    const id = await this.create({
      camp_id: campId,
      user_id: userId,
      qr_token: qrToken,
      status: 'registered'
    });

    return this.findById(id);
  }

  /**
   * Find existing registration for a user at a camp.
   */
  async findExisting(campId, userId) {
    const [rows] = await pool.execute(
      `SELECT * FROM camp_registrations WHERE camp_id = ? AND user_id = ? LIMIT 1`,
      [campId, userId]
    );
    return rows[0] || null;
  }

  /**
   * Find registration by QR token for check-in.
   */
  async findByQrToken(qrToken) {
    const [rows] = await pool.execute(
      `SELECT cr.*, dc.title as camp_title, dc.start_time, dc.city,
              up.name as donor_name, up.blood_group, up.phone
       FROM camp_registrations cr
       JOIN donation_camps dc ON cr.camp_id = dc.id
       JOIN user_profiles up ON cr.user_id = up.user_id
       WHERE cr.qr_token = ? LIMIT 1`,
      [qrToken]
    );
    return rows[0] || null;
  }

  /**
   * Check in a user by QR token.
   */
  async checkIn(qrToken) {
    const [result] = await pool.execute(
      `UPDATE camp_registrations
       SET status = 'checked_in', checked_in_at = NOW()
       WHERE qr_token = ? AND status = 'registered'`,
      [qrToken]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get registrations for a specific camp.
   */
  async getRegistrationsForCamp(campId) {
    const [rows] = await pool.execute(
      `SELECT cr.*, up.name as donor_name, up.blood_group, up.phone, up.avatar_url
       FROM camp_registrations cr
       JOIN user_profiles up ON cr.user_id = up.user_id
       WHERE cr.camp_id = ?
       ORDER BY cr.created_at DESC`,
      [campId]
    );
    return rows;
  }

  /**
   * Get all camps a user is registered for.
   */
  async getRegistrationsForUser(userId) {
    const [rows] = await pool.execute(
      `SELECT cr.*, dc.title, dc.city, dc.start_time, dc.location_name, dc.status as camp_status
       FROM camp_registrations cr
       JOIN donation_camps dc ON cr.camp_id = dc.id
       WHERE cr.user_id = ?
       ORDER BY dc.start_time ASC`,
      [userId]
    );
    return rows;
  }
}

module.exports = new CampRegistrationRepository();
