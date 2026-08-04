const ResponseUtil = require('../utils/response');
const certificateService = require('../services/certificate.service');
const Logger = require('../utils/logger');

module.exports = {
  // GET /api/v2/certificates/my
  getMyCertificates: async (req, res, next) => {
    try {
      const certificates = await certificateService.getDonorCertificates(req.user.id);
      return ResponseUtil.success(res, { message: 'Certificates retrieved successfully.', data: certificates });
    } catch (err) {
      Logger.error('Get donor certificates error', { userId: req.user?.id, error: err.message });
      next(err);
    }
  },

  // GET /api/v2/certificates/:id
  get: async (req, res, next) => {
    try {
      const cert = await certificateService.getById(req.params.id);
      return ResponseUtil.success(res, { message: 'Certificate retrieved successfully.', data: cert });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v2/certificates/generate
  generate: async (req, res, next) => {
    try {
      const cert = await certificateService.generateCertificate({
        donorId: req.body.donorId,
        donationHistoryId: req.body.donationHistoryId,
        donorName: req.body.donorName,
        bloodGroup: req.body.bloodGroup,
        hospitalName: req.body.hospitalName
      });
      return ResponseUtil.success(res, { code: 201, message: 'Certificate generated successfully.', data: cert });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v2/certificates/verify
  verify: async (req, res, next) => {
    try {
      const result = await certificateService.verifyCertificate(req.body.certificateId || req.body.qrCode);
      return ResponseUtil.success(res, { message: 'Certificate verified.', data: result });
    } catch (err) {
      next(err);
    }
  }
};
