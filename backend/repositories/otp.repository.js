const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');
const crypto = require('crypto');

class OtpRepository extends BaseRepository {
  constructor() {
    super('otp_logs');
  }

  _hashOtp(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Create a new OTP log entry. Stores a SHA-256 hash — never plaintext.
   */
  async createOtp({ userId = null, email, otp, purpose, expiresAt, ipAddress = null }) {
    const otpHash = this._hashOtp(otp);
    const insertId = await this.create({
      user_id: userId,
      email,
      otp_code_hash: otpHash,
      purpose,
      expires_at: expiresAt,
      ip_address: ipAddress
    });
    return insertId;
  }

  /**
   * Find the most recent unconsumed OTP for an email+purpose.
   */
  async findLatestOtp(email, purpose) {
    const [rows] = await pool.execute(
      `SELECT * FROM otp_logs
       WHERE email = ? AND purpose = ? AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [email, purpose]
    );
    return rows[0] || null;
  }

  /**
   * Verify an OTP plaintext against the stored hash and check expiry.
   * Returns true if valid and unexpired, false otherwise.
   */
  async verifyOtp(email, otp, purpose) {
    const record = await this.findLatestOtp(email, purpose);
    if (!record) return { valid: false, record: null, reason: 'not_found' };

    if (new Date(record.expires_at) < new Date()) {
      return { valid: false, record, reason: 'expired' };
    }

    const hash = this._hashOtp(otp);
    if (hash !== record.otp_code_hash) {
      // Increment attempt count
      await this.updateById(record.id, { attempt_count: (record.attempt_count || 0) + 1 });
      return { valid: false, record, reason: 'invalid' };
    }

    return { valid: true, record };
  }

  /**
   * Mark an OTP record as consumed.
   */
  async consumeOtp(otpId) {
    return this.updateById(otpId, { consumed_at: new Date() });
  }

  /**
   * Invalidate all unconsumed OTPs for an email+purpose.
   */
  async invalidatePreviousOtps(email, purpose) {
    await pool.execute(
      `UPDATE otp_logs SET consumed_at = NOW()
       WHERE email = ? AND purpose = ? AND consumed_at IS NULL`,
      [email, purpose]
    );
  }
}

module.exports = new OtpRepository();
