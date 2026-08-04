const express = require('express');
const router = express.Router();
const certificateController = require('../../controllers/certificate.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// GET /api/v2/certificates/my
router.get('/my', authenticate, certificateController.getMyCertificates);

// GET /api/v2/certificates/:id
router.get('/:id', authenticate, certificateController.get);

// POST /api/v2/certificates/generate
router.post('/generate', authenticate, certificateController.generate);

// POST /api/v2/certificates/verify
router.post('/verify', certificateController.verify);

module.exports = router;
