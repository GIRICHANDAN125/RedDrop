const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class RequestRepository extends BaseRepository {
  constructor() {
    super('blood_requests');
  }

  /**
   * Find a request with requester's profile data joined.
   */
  async findWithRequester(requestId) {
    const [rows] = await pool.execute(
      `SELECT r.*,
              up.name AS requester_name,
              up.phone AS requester_phone,
              up.avatar_url AS requester_avatar,
              up.avatar_public_id AS requester_avatar_key
       FROM blood_requests r
       JOIN users u ON r.requester_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE r.id = ? LIMIT 1`,
      [requestId]
    );
    return rows[0] || null;
  }

  /**
   * Find a request by its public request_id string (e.g. "RD1A2B3C").
   */
  async findByRequestId(requestId) {
    return this.findOneBy('request_id', requestId);
  }

  /**
   * Check for a duplicate request: same requester + blood_group within the last hour.
   */
  async findRecentDuplicate(requesterId, bloodGroup) {
    const [rows] = await pool.execute(
      `SELECT id FROM blood_requests
       WHERE requester_id = ? AND blood_group = ? AND created_at >= NOW() - INTERVAL 1 HOUR`,
      [requesterId, bloodGroup]
    );
    return rows.length > 0;
  }

  /**
   * Get paginated requests with filters. Returns rows + total count.
   */
  async findFiltered({
    requesterId = null,
    donorBloodGroup = null,
    status = null,
    bloodGroup = null,
    emergencyLevel = null,
    page = 1,
    limit = 20
  } = {}) {
    let sql = `
      SELECT r.*,
             up.name AS requester_name,
             up.avatar_url AS requester_avatar,
             up.avatar_public_id AS requester_avatar_key
      FROM blood_requests r
      JOIN users u ON r.requester_id = u.id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (requesterId) {
      sql += ' AND r.requester_id = ?';
      params.push(requesterId);
    }
    if (donorBloodGroup) {
      sql += ` AND r.blood_group = ? AND r.status IN ('searching', 'pending')`;
      params.push(donorBloodGroup);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (bloodGroup) {
      sql += ' AND r.blood_group = ?';
      params.push(bloodGroup);
    }
    if (emergencyLevel) {
      sql += ' AND r.emergency_level = ?';
      params.push(emergencyLevel);
    }

    const countSql = sql.replace(
      /SELECT r\.\*[\s\S]+?FROM blood_requests r/,
      'SELECT COUNT(*) as total FROM blood_requests r'
    );
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    sql += ` ORDER BY FIELD(r.emergency_level, 'critical', 'high', 'medium', 'low'), r.created_at DESC`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [rows] = await pool.query(sql, params);
    return { rows, total };
  }

  /**
   * Update status and optionally units_fulfilled.
   */
  async updateStatus(requestId, status, unitsFulfilled = null) {
    const data = { status };
    if (unitsFulfilled !== null) data.units_fulfilled = unitsFulfilled;
    return this.updateById(requestId, data);
  }
}

module.exports = new RequestRepository();
