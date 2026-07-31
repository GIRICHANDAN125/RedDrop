const crypto = require('crypto');
const { pool } = require('../config/database');

class CertificateService {
  /**
   * Generate a digital certificate hash and record for a completed blood donation
   */
  async generateCertificate({ donorId, donationHistoryId = null, donorName, bloodGroup, hospitalName }) {
    const certNumber = `CERT-RD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = `${certNumber}:${donorId}:${donorName}:${bloodGroup}:${new Date().toISOString()}`;
    const qrCodeHash = crypto.createHash('sha256').update(payload).digest('hex');

    const [result] = await pool.execute(
      `INSERT INTO certificates (certificate_id, donor_id, donation_history_id, qr_code_hash)
       VALUES (?, ?, ?, ?)`,
      [certNumber, donorId, donationHistoryId, qrCodeHash]
    );

    return {
      id: result.insertId,
      certificateId: certNumber,
      qrCodeHash,
      issuedAt: new Date(),
      verificationUrl: `${process.env.CLIENT_URL || 'https://reddropai.com'}/verify-certificate/${certNumber}`
    };
  }

  /**
   * Public verification of a certificate by ID
   */
  async verifyCertificate(certificateId) {
    const [rows] = await pool.execute(
      `SELECT c.id, c.certificate_id, c.qr_code_hash, c.issued_at,
              dp.user_id, up.name AS donor_name, up.blood_group,
              dh.hospital_name, dh.donation_date
       FROM certificates c
       JOIN donor_profiles dp ON c.donor_id = dp.id
       LEFT JOIN user_profiles up ON up.user_id = dp.user_id
       LEFT JOIN donation_history dh ON c.donation_history_id = dh.id
       WHERE c.certificate_id = ? LIMIT 1`,
      [certificateId]
    );

    if (rows.length === 0) {
      return { isValid: false, reason: 'Certificate not found' };
    }

    const cert = rows[0];
    return {
      isValid: true,
      certificate: {
        id: cert.certificate_id,
        donorName: cert.donor_name || 'Verified RedDrop Donor',
        bloodGroup: cert.blood_group,
        hospitalName: cert.hospital_name || 'Registered Medical Facility',
        donationDate: cert.donation_date || cert.issued_at,
        issuedAt: cert.issued_at,
        verificationHash: cert.qr_code_hash
      }
    };
  }

  /**
   * Get all certificates earned by a donor
   */
  async getDonorCertificates(donorId) {
    const [rows] = await pool.execute(
      `SELECT c.certificate_id, c.qr_code_hash, c.issued_at,
              dh.hospital_name, dh.donation_date
       FROM certificates c
       LEFT JOIN donation_history dh ON c.donation_history_id = dh.id
       WHERE c.donor_id = ?
       ORDER BY c.issued_at DESC`,
      [donorId]
    );
    return rows;
  }
}

module.exports = new CertificateService();
