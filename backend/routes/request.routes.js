const express = require('express');
const router = express.Router();
const {
  createRequest, getRequests, getRequestById,
  respondToRequest, updateRequestStatus, uploadMedicalReport
} = require('../controllers/request.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.post('/', authenticate, createRequest);
router.get('/', authenticate, getRequests);
router.get('/:id', authenticate, getRequestById);
router.post('/:id/respond', authenticate, authorize('donor'), respondToRequest);
router.patch('/:id/status', authenticate, updateRequestStatus);
router.post('/:id/upload-report', authenticate, upload.single('report'), uploadMedicalReport);

module.exports = router;
