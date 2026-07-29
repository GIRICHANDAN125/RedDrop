const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class ResponseRepository extends BaseRepository {
  constructor() {
    super('request_responses');
  }

  /**
   * Find a response by request_id + donor_id (the unique pair).
   */
  async findByRequestAndDonor(requestId, donorProfileId) {
    const [rows] = await pool.execute(
      'SELECT * FROM request_responses WHERE request_id = ? AND donor_id = ? LIMIT 1',
      [requestId, donorProfileId]
    );
    return rows[0] || null;
  }

  /**
   * Upsert a donor's response: insert if new, update if existing.
   */
  async upsertResponse({ requestId, donorProfileId, units = 1, status, acceptedAt = null }) {
    const existing = await this.findByRequestAndDonor(requestId, donorProfileId);

    if (!existing) {
      return this.create({
        request_id: requestId,
        donor_id: donorProfileId,
        units,
        status,
        accepted_at: acceptedAt,
        responded_at: new Date()
      });
    }

    await this.updateById(existing.id, {
      status,
      accepted_at: acceptedAt,
      responded_at: new Date()
    });
    return existing.id;
  }

  /**
   * Get all responses for a request, with donor + user data joined.
   */
  async getResponsesForRequest(requestId) {
    const [rows] = await pool.execute(
      `SELECT rr.id, rr.status, rr.distance_km AS distance, rr.eta_minutes AS eta,
              dp.id AS donor_profile_id, dp.user_id,
              up.name, up.phone, up.avatar_url AS avatar, up.avatar_public_id AS avatar_key,
              up.location_lat, up.location_lng
       FROM request_responses rr
       JOIN donor_profiles dp ON rr.donor_id = dp.id
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE rr.request_id = ?`,
      [requestId]
    );
    return rows;
  }

  /**
   * Mark a response as donated.
   */
  async markDonated(responseId) {
    return this.updateById(responseId, {
      status: 'donated',
      donated_at: new Date()
    });
  }

  /**
   * Find responses with donor status = 'donated' for a request (for badge awarding).
   */
  async findDonatedForRequest(requestId) {
    const [rows] = await pool.execute(
      `SELECT rr.donor_id, dp.user_id
       FROM request_responses rr
       JOIN donor_profiles dp ON rr.donor_id = dp.id
       WHERE rr.request_id = ? AND rr.status = 'donated' LIMIT 1`,
      [requestId]
    );
    return rows;
  }
}

module.exports = new ResponseRepository();
