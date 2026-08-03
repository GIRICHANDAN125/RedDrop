/**
 * V2 Certificate Routes — /api/v2/certificates
 * RedDrop AI V2 Digital Donation Certificate endpoints
 */
const express = require('express');
const router = express.Router();

// TODO: wire certificate controller and auth middleware
// const certificateController = require('../../controllers/certificate.controller');
// const { authenticate } = require('../../middleware/auth.middleware');

// GET /api/v2/certificates/:id
// router.get('/:id', authenticate, certificateController.get);

// POST /api/v2/certificates/generate
// router.post('/generate', authenticate, certificateController.generate);

module.exports = router;
