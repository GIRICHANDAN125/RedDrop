const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class PatientRepository extends BaseRepository {
  constructor() {
    super('patient_profiles');
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
      `UPDATE patient_profiles SET ${setClause} WHERE user_id = ?`,
      [...Object.values(data), userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new PatientRepository();
