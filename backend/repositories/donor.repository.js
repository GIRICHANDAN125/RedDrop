const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class DonorRepository extends BaseRepository {
  constructor() {
    super('donor_profiles');
  }

  /**
   * Find a donor profile by user_id.
   */
  async findByUserId(userId) {
    return this.findOneBy('user_id', userId);
  }

  /**
   * Create a donor_profile row for a user.
   */
  async createForUser(userId) {
    return this.create({ user_id: userId });
  }

  /**
   * Get donor profile merged with user auth + profile data.
   */
  async findFullProfileByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT dp.*, up.name, up.email, up.phone, up.blood_group, up.city, up.state,
              up.avatar_url, up.avatar_public_id, up.location_lat, up.location_lng,
              u.email_verified, u.is_active, u.last_seen
       FROM donor_profiles dp
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE dp.user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Find donor profile merged with user data by donor_profiles.id (not user_id).
   */
  async findFullProfileById(donorProfileId) {
    const [rows] = await pool.execute(
      `SELECT dp.*, up.name, up.avatar_url, up.avatar_public_id,
              up.location_lat, up.location_lng, u.is_active
       FROM donor_profiles dp
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE dp.id = ? LIMIT 1`,
      [donorProfileId]
    );
    return rows[0] || null;
  }

  /**
   * Search donors with optional filters. Returns merged donor+user_profile rows.
   */
  async searchDonors({ bloodGroup, city, state, available, query, limit = 50 } = {}) {
    let sql = `
      SELECT dp.*, up.name, up.phone, up.avatar_url, up.avatar_public_id,
             up.city, up.state, up.blood_group, up.location_lat, up.location_lng
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (bloodGroup) {
      sql += ' AND up.blood_group = ?';
      params.push(bloodGroup);
    }
    if (city) {
      sql += ' AND up.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (state) {
      sql += ' AND up.state LIKE ?';
      params.push(`%${state}%`);
    }
    if (available === true || available === 'true') {
      sql += ' AND dp.is_available = 1';
    }
    if (query) {
      sql += ' AND up.name LIKE ?';
      params.push(`%${query}%`);
    }

    sql += ' LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * Find nearby donors using Haversine formula.
   * Returns merged donor+user rows with a `distance` column (km).
   */
  async findNearbyDonors({ lat, lng, bloodGroups = [], maxDistanceKm = 20, limit = 20 }) {
    let sql = `
      SELECT dp.*, up.name, up.phone, up.avatar_url, up.avatar_public_id,
             up.blood_group, up.location_lat, up.location_lng, up.city,
             u.fcm_token, u.last_seen,
             (6371 * acos(
               cos(radians(?)) * cos(radians(up.location_lat)) *
               cos(radians(up.location_lng) - radians(?)) +
               sin(radians(?)) * sin(radians(up.location_lat))
             )) AS distance
      FROM donor_profiles dp
      JOIN users u ON dp.user_id = u.id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE dp.is_available = 1 AND dp.is_fit_to_donate = 1
        AND up.location_lat IS NOT NULL AND up.location_lng IS NOT NULL
    `;
    const params = [parseFloat(lat), parseFloat(lng), parseFloat(lat)];

    if (bloodGroups.length > 0) {
      const placeholders = bloodGroups.map(() => '?').join(',');
      sql += ` AND up.blood_group IN (${placeholders})`;
      params.push(...bloodGroups);
    }

    sql += ' HAVING distance <= ? ORDER BY distance ASC LIMIT ?';
    params.push(maxDistanceKm, parseInt(limit));

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Update donor profile by user_id.
   */
  async updateByUserId(userId, data) {
    const columns = Object.keys(data);
    if (columns.length === 0) return false;
    const setClause = columns.map((c) => `${c} = ?`).join(', ');
    const [result] = await pool.execute(
      `UPDATE donor_profiles SET ${setClause} WHERE user_id = ?`,
      [...Object.values(data), userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Increment donation count and update last_donation_date.
   */
  async recordDonation(userId) {
    const [result] = await pool.execute(
      `UPDATE donor_profiles
       SET total_donations = total_donations + 1, last_donation_date = CURDATE()
       WHERE user_id = ?`,
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new DonorRepository();
