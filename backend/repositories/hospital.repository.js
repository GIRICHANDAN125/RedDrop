const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class HospitalRepository extends BaseRepository {
  constructor() {
    super('hospital_profiles');
  }

  async findByUserId(userId) {
    return this.findOneBy('user_id', userId);
  }

  async createForUser(userId, data = {}) {
    return this.create({ user_id: userId, ...data });
  }

  async updateByUserId(userId, data) {
    const columns = Object.keys(data);
    if (columns.length === 0) return false;
    const setClause = columns.map((c) => `${c} = ?`).join(', ');
    const [result] = await pool.execute(
      `UPDATE hospital_profiles SET ${setClause} WHERE user_id = ?`,
      [...Object.values(data), userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Find hospitals nearby using Haversine formula.
   */
  async findNearby({ lat, lng, maxDistanceKm = 50, limit = 20 }) {
    const [rows] = await pool.query(
      `SELECT hp.*,
              (6371 * acos(
                cos(radians(?)) * cos(radians(hp.location_lat)) *
                cos(radians(hp.location_lng) - radians(?)) +
                sin(radians(?)) * sin(radians(hp.location_lat))
              )) AS distance
       FROM hospital_profiles hp
       WHERE hp.location_lat IS NOT NULL AND hp.location_lng IS NOT NULL
       HAVING distance <= ?
       ORDER BY distance ASC
       LIMIT ?`,
      [parseFloat(lat), parseFloat(lng), parseFloat(lat), maxDistanceKm, parseInt(limit)]
    );
    return rows;
  }

  /**
   * Find all verified hospitals (for listing when no location given).
   */
  async findAllVerified(limit = 20) {
    const [rows] = await pool.execute(
      `SELECT hp.*, u.email
       FROM hospital_profiles hp
       JOIN users u ON hp.user_id = u.id
       WHERE hp.is_verified = 1
       ORDER BY hp.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );
    return rows;
  }
}

module.exports = new HospitalRepository();
