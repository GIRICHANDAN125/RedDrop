/**
 * Certificate Controller — HTTP request handlers for digital certificates (RedDrop AI V2)
 * Route: /api/v2/certificates
 */
const ResponseUtil = require('../utils/response');

// TODO: inject CertificateService
// const certificateService = require('../services/certificate.service');

module.exports = {
  // GET /api/v2/certificates/:id
  get: async (req, res, next) => {
    try {
      // const cert = await certificateService.getById(req.params.id);
      return ResponseUtil.success(res, { message: 'Certificate retrieved successfully.', data: {} });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v2/certificates/generate
  generate: async (req, res, next) => {
    try {
      // const cert = await certificateService.generate(req.body);
      return ResponseUtil.success(res, { code: 201, message: 'Certificate generated successfully.', data: {} });
    } catch (err) {
      next(err);
    }
  }
};
