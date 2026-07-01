// tracking.routes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const BloodRequest = require('../models/BloodRequest.model');

router.get('/:requestId', authenticate, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId)
      .select('status timeline requestId patientName bloodGroup hospital assignedDonors')
      .populate('assignedDonors.donor', 'user location')
      .populate('assignedDonors.donor.user', 'name phone avatar');

    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json({ success: true, tracking: request });
  } catch (error) {
    res.status(500).json({ error: 'Tracking fetch failed.' });
  }
});

module.exports = router;
