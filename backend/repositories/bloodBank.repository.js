const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class BloodBankRepository extends BaseRepository {
  constructor() {
    super('blood_banks');
  }

  async getByHospitalId(hospitalId) {
    const [rows] = await pool.execute(
      `SELECT * FROM blood_banks WHERE hospital_profile_id = ? LIMIT 1`,
      [hospitalId]
    );
    return rows[0] || null;
  }

  async updateInventory(hospitalId, unitsAvailableJson) {
    const [result] = await pool.execute(
      `UPDATE blood_banks SET units_available = ? WHERE hospital_profile_id = ?`,
      [JSON.stringify(unitsAvailableJson), hospitalId]
    );
    return result.affectedRows > 0;
  }

  async findNearby({ lat, lng, maxDistanceKm = 50, limit = 20 }) {
    const [rows] = await pool.query(
      `SELECT bb.*,
              (6371 * acos(
                cos(radians(?)) * cos(radians(bb.location_lat)) *
                cos(radians(bb.location_lng) - radians(?)) +
                sin(radians(?)) * sin(radians(bb.location_lat))
              )) AS distance
       FROM blood_banks bb
       WHERE bb.location_lat IS NOT NULL AND bb.location_lng IS NOT NULL
       HAVING distance <= ?
       ORDER BY distance ASC
       LIMIT ?`,
      [parseFloat(lat), parseFloat(lng), parseFloat(lat), maxDistanceKm, parseInt(limit)]
    );
    return rows;
  }
}

module.exports = new BloodBankRepository();
