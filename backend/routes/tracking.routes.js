const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');
const { getSignedFileUrl } = require('../config/aws');

router.get('/:requestId', authenticate, async (req, res) => {
  try {
    // 1. Get request details
    const [reqRows] = await pool.execute(
      `SELECT id, request_id as requestId, status, patient_name as patientName, blood_group as bloodGroup, 
              hospital_name as hospitalName, hospital_address as hospitalAddress, 
              hospital_city as hospitalCity, hospital_lat as hospitalLat, hospital_lng as hospitalLng
       FROM blood_requests WHERE id = ?`, 
      [req.params.requestId]
    );

    if (reqRows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    const tracking = reqRows[0];
    
    tracking.hospital = {
      name: tracking.hospitalName,
      address: tracking.hospitalAddress,
      city: tracking.hospitalCity,
      location: { lat: tracking.hospitalLat, lng: tracking.hospitalLng }
    };

    // 2. Get timeline
    const [timelineRows] = await pool.execute(
      'SELECT status, note, created_at as date FROM request_timelines WHERE request_id = ? ORDER BY created_at ASC',
      [req.params.requestId]
    );
    tracking.timeline = timelineRows;

    // 3. Get assigned donors
    const [donorRows] = await pool.execute(
            `SELECT ad.id, ad.status, ad.distance, ad.eta_minutes as eta,
              d.id as donor_id, 
              u.id as user_id, u.name, u.phone, u.avatar_url as avatar, u.avatar_public_id as avatar_key, u.location_lat, u.location_lng
       FROM assigned_donors ad
       JOIN donors d ON ad.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE ad.request_id = ?`,
       [req.params.requestId]
    );

    tracking.assignedDonors = await Promise.all(donorRows.map(async row => ({
      _id: row.id,
      id: row.id,
      status: row.status,
      distance: row.distance,
      eta: row.eta,
      donor: {
        _id: row.donor_id,
        id: row.donor_id,
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

    // Clean up temporary flat fields
    delete tracking.hospitalName;
    delete tracking.hospitalAddress;
    delete tracking.hospitalCity;
    delete tracking.hospitalLat;
    delete tracking.hospitalLng;

    res.json({ success: true, tracking });
  } catch (error) {
    console.error('Tracking fetch failed:', error);
    res.status(500).json({ error: 'Tracking fetch failed.' });
  }
});

module.exports = router;
