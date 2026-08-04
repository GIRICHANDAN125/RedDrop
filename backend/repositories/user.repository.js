const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return this.findOneBy('email', email);
  }

  /** Check if a phone number is already taken in user_profiles or users table. */
  async findByPhone(phone) {
    if (!phone) return null;
    try {
      const [rows] = await pool.execute(
        'SELECT id FROM user_profiles WHERE phone = ? LIMIT 1',
        [phone]
      );
      if (rows[0]) return rows[0];
    } catch {
      // Ignore if user_profiles table not present
    }

    try {
      const [rows] = await pool.execute(
        'SELECT id FROM users WHERE phone = ? LIMIT 1',
        [phone]
      );
      return rows[0] || null;
    } catch {
      return null;
    }
  }

  /** users + user_profiles merged, plus an array of role names. */
  async findFullProfileById(userId) {
    let baseUser = null;
    try {
      const [rows] = await pool.execute(
        `SELECT u.id, u.email, 
                COALESCE(u.email_verified, u.is_verified, FALSE) as email_verified, 
                u.is_active, u.fcm_token,
                u.last_seen, u.created_at, u.updated_at,
                COALESCE(p.name, u.name) as name, 
                COALESCE(p.phone, u.phone) as phone, 
                p.gender, p.dob, 
                COALESCE(p.blood_group, u.blood_group) as blood_group,
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
      baseUser = rows[0] || null;
    } catch {
      baseUser = await this.findById(userId);
    }

    if (!baseUser) return null;

    let roles = [];
    try {
      const [roleRows] = await pool.execute(
        `SELECT r.name FROM roles r
         JOIN user_roles ur ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [userId]
      );
      roles = roleRows.map((r) => r.name);
    } catch {
      roles = baseUser.role ? [baseUser.role] : ['patient'];
    }

    if (roles.length === 0) roles = ['patient'];

    return { ...baseUser, roles };
  }

  async createAuthUser({ name = '', email, emailVerified = false }) {
    try {
      const data = { email, email_verified: emailVerified };
      if (name) data.name = name;
      const insertId = await this.create(data);
      return insertId;
    } catch (err) {
      try {
        const [result] = await pool.execute(
          `INSERT INTO users (name, email, is_verified) VALUES (?, ?, ?)`,
          [name || 'User', email, emailVerified ? 1 : 0]
        );
        return result.insertId;
      } catch (err2) {
        const [result] = await pool.execute(
          `INSERT INTO users (email) VALUES (?)`,
          [email]
        );
        return result.insertId;
      }
    }
  }

  async markEmailVerified(userId) {
    try {
      await this.updateById(userId, { email_verified: true });
    } catch {
      try {
        await this.updateById(userId, { is_verified: true });
      } catch {
        // Ignore
      }
    }
  }

  async upsertProfile(userId, profileData) {
    const columns = Object.keys(profileData);
    if (columns.length === 0) return false;

    // Update users table name/phone/blood_group if present for backwards compatibility
    try {
      const userCols = {};
      if (profileData.name) userCols.name = profileData.name;
      if (profileData.phone) userCols.phone = profileData.phone;
      if (profileData.blood_group) userCols.blood_group = profileData.blood_group;
      if (Object.keys(userCols).length > 0) {
        await this.updateById(userId, userCols);
      }
    } catch {
      // Ignore
    }

    try {
      const [existing] = await pool.execute(
        'SELECT id FROM user_profiles WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (existing.length > 0) {
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
    } catch {
      return false;
    }
  }
}

module.exports = new UserRepository();
