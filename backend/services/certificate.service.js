const crypto = require('crypto');
const certificateRepository = require('../repositories/certificate.repository');
const donorRepository = require('../repositories/donor.repository');
const { pool } = require('../config/database');

class CertificateService {
  async generateCertificate({ donorId, donationHistoryId = null, donorName, bloodGroup, hospitalName }) {
    const certNumber = `CERT-RD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = `${certNumber}:${donorId}:${donorName}:${bloodGroup}:${new Date().toISOString()}`;
    const qrCodeHash = crypto.createHash('sha256').update(payload).digest('hex');

    const insertId = await certificateRepository.create({
      certificate_id: certNumber,
      donor_id: donorId,
      donation_history_id: donationHistoryId,
      qr_code_hash: qrCodeHash
    });

    return {
      id: insertId,
      certificateId: certNumber,
      qrCodeHash,
      issuedAt: new Date(),
      verificationUrl: `${process.env.CLIENT_URL || 'https://reddropai.com'}/verify-certificate/${certNumber}`
    };
  }

  async verifyCertificate(certificateId) {
    const cert = await certificateRepository.findByCertificateId(certificateId);
    if (!cert) {
      return { isValid: false, reason: 'Certificate not found' };
    }

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

  async getDonorCertificates(userId) {
    const donor = await donorRepository.findByUserId(userId);
    if (!donor) return [];
    return await certificateRepository.findByDonorId(donor.id);
  }

  async getById(certificateId) {
    const cert = await certificateRepository.findByCertificateId(certificateId);
    if (!cert) {
      throw { statusCode: 404, message: 'Certificate not found.' };
    }
    return cert;
  }
}

module.exports = new CertificateService();
