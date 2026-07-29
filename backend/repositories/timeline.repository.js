const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class TimelineRepository extends BaseRepository {
  constructor() {
    super('request_timelines');
  }

  /**
   * Add a timeline entry for a blood request.
   */
  async addEntry({ requestId, status, note = null, updatedBy = null }) {
    return this.create({
      request_id: requestId,
      status,
      note,
      updated_by: updatedBy
    });
  }

  /**
   * Get all timeline entries for a request, ordered chronologically.
   */
  async getForRequest(requestId) {
    const [rows] = await pool.execute(
      'SELECT status, note, created_at as date FROM request_timelines WHERE request_id = ? ORDER BY created_at ASC',
      [requestId]
    );
    return rows;
  }
}

module.exports = new TimelineRepository();
