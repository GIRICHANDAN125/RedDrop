/**
 * Certificate Repository — Data access layer for digital donation certificates (RedDrop AI V2)
 */
const BaseRepository = require('./base.repository');

class CertificateRepository extends BaseRepository {
  constructor() {
    super('donation_certificates');
  }

  // TODO: implement certificate-specific queries
  // async findByDonorId(donorId) { ... }
  // async findByQrCode(qrCode) { ... }
}

module.exports = new CertificateRepository();
