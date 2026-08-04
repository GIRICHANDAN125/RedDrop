const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class CampRepository extends BaseRepository {
  constructor() {
    super('donation_camps');
  }

  async findUpcoming({ city, limit = 20 }) {
    let query = `
      SELECT dc.*, u.email as organizer_email, up.name as organizer_name
      FROM donation_camps dc
      JOIN users u ON dc.organizer_user_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE dc.status IN ('upcoming', 'active')
    `;
    const params = [];

    if (city) {
      query += ` AND LOWER(dc.city) = LOWER(?)`;
      params.push(city);
    }

    query += ` ORDER BY dc.start_time ASC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  async findByOrganizer(organizerUserId) {
    const [rows] = await pool.execute(
      `SELECT * FROM donation_camps WHERE organizer_user_id = ? ORDER BY start_time DESC`,
      [organizerUserId]
    );
    return rows;
  }

  async updateUnits(campId, additionalUnits) {
    const [result] = await pool.execute(
      `UPDATE donation_camps SET collected_units = collected_units + ? WHERE id = ?`,
      [additionalUnits, campId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CampRepository();
