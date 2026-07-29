const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const requestRepository = require('../repositories/request.repository');
const responseRepository = require('../repositories/response.repository');
const timelineRepository = require('../repositories/timeline.repository');
const { getSignedFileUrl } = require('../config/aws');

router.get('/:requestId', authenticate, async (req, res) => {
  try {
    // 1. Get request details
    const requestRow = await requestRepository.findById(req.params.requestId);
    if (!requestRow) return res.status(404).json({ error: 'Request not found.' });

    const tracking = {
      id: requestRow.id,
      requestId: requestRow.request_id,
      status: requestRow.status,
      patientName: requestRow.patient_name,
      bloodGroup: requestRow.blood_group,
      hospital: {
        name: requestRow.hospital_name,
        address: requestRow.hospital_address,
        city: requestRow.hospital_city,
        location: {
          lat: requestRow.hospital_lat,
          lng: requestRow.hospital_lng
        }
      }
    };

    // 2. Get timeline
    tracking.timeline = await timelineRepository.getForRequest(req.params.requestId);

    // 3. Get assigned donor responses
    const donorRows = await responseRepository.getResponsesForRequest(req.params.requestId);

    tracking.assignedDonors = await Promise.all(donorRows.map(async (row) => ({
      _id: row.id,
      id: row.id,
      status: row.status,
      distance: row.distance,
      eta: row.eta,
      donor: {
        _id: row.donor_profile_id,
        id: row.donor_profile_id,
        user: {
          _id: row.user_id,
          id: row.user_id,
          name: row.name,
          phone: row.phone,
          avatar: {
            url: row.avatar_key ? await getSignedFileUrl(row.avatar_key) : row.avatar,
            key: row.avatar_key || null
          }
        },
        location: { lat: row.location_lat, lng: row.location_lng }
      }
    })));

    res.json({ success: true, tracking });
  } catch (error) {
    console.error('Tracking fetch failed:', error);
    res.status(500).json({ error: 'Tracking fetch failed.' });
  }
});

module.exports = router;
