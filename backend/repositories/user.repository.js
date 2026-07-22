const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

/**
 * UserRepository
 * `users` (auth core) and `user_profiles` (everything else) are 1:1 in
 * schema_v2.sql. Controllers generally want both together, so the read
 * helpers here return a merged view; writes go to the correct table.
 */
class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return this.findOneBy('email', email);
  }

  /** users + user_profiles merged, plus an array of role names. */
  async findFullProfileById(userId) {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.email_verified, u.is_active, u.fcm_token,
              u.last_seen, u.created_at, u.updated_at,
              p.name, p.phone, p.gender, p.dob, p.blood_group,
              p.avatar_url, p.avatar_public_id,
              p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relation,
              p.address, p.city, p.state, p.pincode,
              p.location_lat, p.location_lng, p.medical_conditions,
              p.is_profile_complete
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    if (!rows[0]) return null;

    const [roleRows] = await pool.execute(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId]
    );

    return { ...rows[0], roles: roleRows.map((r) => r.name) };
  }

  /**
   * Creates a bare auth-only user row. Used by OTP signup: profile is
   * filled in later via upsertProfile, and is always skippable.
   */
  async createAuthUser({ email, emailVerified = false }) {
    const insertId = await this.create({
      email,
      email_verified: emailVerified,
    });
    return insertId;
  }

  async markEmailVerified(userId) {
    return this.updateById(userId, { email_verified: true });
  }

  async upsertProfile(userId, profileData) {
    const existing = await pool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );
    const columns = Object.keys(profileData);
    if (columns.length === 0) return false;

    if (existing[0].length > 0) {
      const setClause = columns.map((c) => `${c} = ?`).join(', ');
      await pool.execute(
        `UPDATE user_profiles SET ${setClause} WHERE user_id = ?`,
        [...Object.values(profileData), userId]
      );
    } else {
      await pool.execute(
        `INSERT INTO user_profiles (user_id, ${columns.join(', ')}) VALUES (?, ${columns.map(() => '?').join(', ')})`,
        [userId, ...Object.values(profileData)]
      );
    }
    return true;
  }
}

module.exports = new UserRepository();
