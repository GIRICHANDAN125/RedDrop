const { pool } = require('../config/database');
const BaseRepository = require('./base.repository');

class CertificateRepository extends BaseRepository {
  constructor() {
    super('certificates');
  }

  async findByDonorId(donorId) {
    const [rows] = await pool.execute(
      `SELECT c.*, dh.hospital_name, dh.donation_date, dh.units, up.name as donor_name, up.blood_group
       FROM certificates c
       JOIN donor_profiles dp ON c.donor_id = dp.id
       LEFT JOIN user_profiles up ON dp.user_id = up.user_id
       LEFT JOIN donation_history dh ON c.donation_history_id = dh.id
       WHERE c.donor_id = ?
       ORDER BY c.issued_at DESC`,
      [donorId]
    );
    return rows;
  }

  async findByCertificateId(certificateId) {
    const [rows] = await pool.execute(
      `SELECT c.*, dh.hospital_name, dh.donation_date, dh.units, up.name as donor_name, up.blood_group
       FROM certificates c
       JOIN donor_profiles dp ON c.donor_id = dp.id
       LEFT JOIN user_profiles up ON dp.user_id = up.user_id
       LEFT JOIN donation_history dh ON c.donation_history_id = dh.id
       WHERE c.certificate_id = ?
       LIMIT 1`,
      [certificateId]
    );
    return rows[0] || null;
  }

  async findByQrHash(qrCodeHash) {
    const [rows] = await pool.execute(
      `SELECT c.*, dh.hospital_name, dh.donation_date, up.name as donor_name, up.blood_group
       FROM certificates c
       JOIN donor_profiles dp ON c.donor_id = dp.id
       LEFT JOIN user_profiles up ON dp.user_id = up.user_id
       LEFT JOIN donation_history dh ON c.donation_history_id = dh.id
       WHERE c.qr_code_hash = ?
       LIMIT 1`,
      [qrCodeHash]
    );
    return rows[0] || null;
  }
}

module.exports = new CertificateRepository();
