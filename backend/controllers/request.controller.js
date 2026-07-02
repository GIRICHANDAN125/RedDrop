const { pool } = require('../config/database');
const { createNotification, notifyNearbyDonors } = require('../services/notification.service');
const { verifyMedicalReport } = require('../services/aiVerification.service');
const { emitToRequest, emitToUser } = require('../config/socket');
const crypto = require('crypto');

const generateRequestId = () => {
  return 'RD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

// POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const {
      patientName, bloodGroup, unitsRequired,
      emergencyLevel, hospital, notes, isAnonymous
    } = req.body;

    const [users] = await pool.execute('SELECT created_at FROM users WHERE id = ?', [req.user.id]);
    
    // AI fake detection pre-check
    const aiAnalysis = await analyzeRequest(req.body, req.user.id, users[0]?.created_at);

    if (aiAnalysis.fakeDetectionScore > 80) {
      return res.status(422).json({
        error: 'Request flagged as suspicious. Please contact support.',
        flags: aiAnalysis.flags
      });
    }

    const requestId = generateRequestId();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const [result] = await pool.execute(
      `INSERT INTO blood_requests (request_id, requester_id, patient_name, blood_group, units_required, emergency_level, hospital_name, hospital_city, hospital_lat, hospital_lng, status, expires_at, notes, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'searching', ?, ?, ?)`,
      [requestId, req.user.id, patientName, bloodGroup, unitsRequired, emergencyLevel, hospital.name, hospital.city, hospital.location?.coordinates[1] || null, hospital.location?.coordinates[0] || null, expiresAt, notes, isAnonymous ? 1 : 0]
    );

    const newRequestId = result.insertId;

    await pool.execute(
      `INSERT INTO request_timelines (request_id, status, note, updated_by) VALUES (?, 'pending', 'Request created', ?)`,
      [newRequestId, req.user.id]
    );

    await processRequestAsync(newRequestId);

    const [requestRows] = await pool.execute('SELECT * FROM blood_requests WHERE id = ?', [newRequestId]);

    res.status(201).json({
      success: true,
      message: 'Blood request created! Searching for donors...',
      request: requestRows[0]
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Failed to create blood request.' });
  }
};

// GET /api/requests
exports.getRequests = async (req, res) => {
  try {
    const { status, bloodGroup, emergencyLevel, page = 1, limit = 20 } = req.query;
    let sql = `
      SELECT r.*, u.name as requester_name, u.avatar_url as requester_avatar
      FROM blood_requests r
      JOIN users u ON r.requester_id = u.id
      WHERE 1=1
    `;
    let params = [];

    // Role-based filtering
    if (req.user.role === 'receiver') {
      sql += ` AND r.requester_id = ?`;
      params.push(req.user.id);
    } else if (req.user.role === 'donor') {
      const [users] = await pool.execute('SELECT blood_group FROM users WHERE id = ?', [req.user.id]);
      sql += ` AND r.blood_group = ? AND r.status IN ('searching', 'pending')`;
      params.push(users[0]?.blood_group);
    }

    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (bloodGroup) {
      sql += ` AND r.blood_group = ?`;
      params.push(bloodGroup);
    }
    if (emergencyLevel) {
      sql += ` AND r.emergency_level = ?`;
      params.push(emergencyLevel);
    }

    const countSql = sql.replace('SELECT r.*, u.name as requester_name, u.avatar_url as requester_avatar', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.execute(countSql, params);
    const total = countRows[0].total;

    // Custom order by emergency level
    sql += ` ORDER BY FIELD(r.emergency_level, 'critical', 'high', 'medium', 'low'), r.created_at DESC`;
    sql += ` LIMIT ? OFFSET ?`;
    
    const limitInt = parseInt(limit);
    const offsetInt = (parseInt(page) - 1) * limitInt;
    params.push(limitInt.toString(), offsetInt.toString());

    // NOTE: pool.execute doesn't easily support string params for limit/offset without strict type conversions, pool.query is safer or parsing them to int with named placeholders.
    const [requests] = await pool.query(sql, params.map(p => Number.isNaN(Number(p)) ? p : Number(p)));

    res.json({
      success: true,
      requests,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Fetch requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// GET /api/requests/:id
exports.getRequestById = async (req, res) => {
  try {
    const [requests] = await pool.execute(
      `SELECT r.*, u.name as requester_name, u.phone as requester_phone, u.avatar_url as requester_avatar 
       FROM blood_requests r JOIN users u ON r.requester_id = u.id WHERE r.id = ?`,
      [req.params.id]
    );

    if (requests.length === 0) return res.status(404).json({ error: 'Request not found.' });

    const [assignedDonors] = await pool.execute(
      `SELECT ad.*, u.name as donor_name, u.phone as donor_phone
       FROM assigned_donors ad
       JOIN donors d ON ad.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE ad.request_id = ?`,
      [req.params.id]
    );

    const request = requests[0];
    request.assignedDonors = assignedDonors;

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request.' });
  }
};

// POST /api/requests/:id/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const [requests] = await pool.execute('SELECT * FROM blood_requests WHERE id = ?', [req.params.id]);
    if (requests.length === 0) return res.status(404).json({ error: 'Request not found.' });
    
    const request = requests[0];

    const [donors] = await pool.execute('SELECT id, requests_accepted, requests_declined FROM donors WHERE user_id = ?', [req.user.id]);
    if (donors.length === 0) return res.status(404).json({ error: 'Donor profile not found.' });

    const donor = donors[0];
    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    const [assigned] = await pool.execute(
      'SELECT id FROM assigned_donors WHERE request_id = ? AND donor_id = ?',
      [request.id, donor.id]
    );

    if (assigned.length === 0) {
      await pool.execute(
        `INSERT INTO assigned_donors (request_id, donor_id, units, status, accepted_at) VALUES (?, ?, ?, ?, ?)`,
        [request.id, donor.id, Math.min(1, request.units_required - request.units_fulfilled), newStatus, action === 'accept' ? new Date() : null]
      );
    } else {
      await pool.execute(
        `UPDATE assigned_donors SET status = ?, accepted_at = ? WHERE id = ?`,
        [newStatus, action === 'accept' ? new Date() : null, assigned[0].id]
      );
    }

    if (action === 'accept') {
      await pool.execute('UPDATE blood_requests SET status = ? WHERE id = ?', ['donor_found', request.id]);
      await pool.execute(
        `INSERT INTO request_timelines (request_id, status, note, updated_by) VALUES (?, 'donor_found', ?, ?)`,
        [request.id, `Donor ${req.user.name} accepted the request`, req.user.id]
      );

      await createNotification(request.requester_id, {
        type: 'donor_found',
        title: '🎉 Donor Found!',
        body: `${req.user.name} has accepted your blood request.`,
        data: { requestId: request.id }
      });

      emitToRequest(request.id.toString(), 'request:updated', { status: 'donor_found' });
      emitToUser(request.requester_id.toString(), 'donor:accepted', { requestId: request.id });
    }

    let reqAccepted = donor.requests_accepted + (action === 'accept' ? 1 : 0);
    let reqDeclined = donor.requests_declined + (action === 'decline' ? 1 : 0);
    let responseRate = Math.round((reqAccepted / (reqAccepted + reqDeclined)) * 100) || 100;

    await pool.execute(
      'UPDATE donors SET requests_accepted = ?, requests_declined = ?, response_rate = ? WHERE id = ?',
      [reqAccepted, reqDeclined, responseRate, donor.id]
    );

    res.json({ success: true, message: `Request ${action}ed successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to respond to request.' });
  }
};

// PATCH /api/requests/:id/status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['in_transit', 'at_hospital', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const [requests] = await pool.execute('SELECT * FROM blood_requests WHERE id = ?', [req.params.id]);
    if (requests.length === 0) return res.status(404).json({ error: 'Request not found.' });
    
    const request = requests[0];

    const isCompleted = status === 'completed';
    const fulfilledUnits = isCompleted ? request.units_required : request.units_fulfilled;

    await pool.execute(
      'UPDATE blood_requests SET status = ?, units_fulfilled = ? WHERE id = ?',
      [status, fulfilledUnits, request.id]
    );

    await pool.execute(
      `INSERT INTO request_timelines (request_id, status, note, updated_by) VALUES (?, ?, ?, ?)`,
      [request.id, status, note || getStatusNote(status), req.user.id]
    );

    emitToRequest(request.id.toString(), 'request:status', { status });

    const notifType = status === 'completed' ? 'blood_delivered' : 'blood_in_transit';
    await createNotification(request.requester_id, {
      type: notifType,
      title: getStatusTitle(status),
      body: getStatusNote(status),
      data: { requestId: request.id }
    });

    if (isCompleted) {
      await awardBadges(request.id);
    }

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// POST /api/requests/:id/upload-report
exports.uploadMedicalReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { secure_url, public_id } = req.file;
    const aiVerification = await verifyMedicalReport(secure_url);
    
    // In SQL, we can store this in a JSON column or new table. Since we don't have it in schema, we will skip or alter it.
    // Assuming we added a 'medical_report_url' and 'medical_report_verification' JSON column to blood_requests.

    res.json({
      success: true,
      message: 'Medical report uploaded and analyzed.',
      verification: aiVerification
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed.' });
  }
};

// --- Helpers ---

async function processRequestAsync(requestId) {
  setTimeout(async () => {
    try {
      const [requests] = await pool.execute('SELECT * FROM blood_requests WHERE id = ?', [requestId]);
      if (requests.length === 0) return;
      const request = requests[0];

      if (request.hospital_lat && request.hospital_lng) {
        let sql = `
          SELECT d.*, u.name, u.fcm_token, u.location_lat, u.location_lng,
                (6371 * acos(cos(radians(?)) * cos(radians(u.location_lat)) * cos(radians(u.location_lng) - radians(?)) + sin(radians(?)) * sin(radians(u.location_lat)))) AS distance
          FROM donors d
          JOIN users u ON d.user_id = u.id
          WHERE d.is_available = 1 AND u.blood_group = ?
          HAVING distance <= 30
          LIMIT 15
        `;
        const [nearbyDonors] = await pool.query(sql, [request.hospital_lat, request.hospital_lng, request.hospital_lat, request.blood_group]);
        await notifyNearbyDonors(nearbyDonors, request);
      }
    } catch (err) {
      console.error('Async process error:', err);
    }
  }, 500);
}

async function analyzeRequest(data, userId, userCreatedAt) {
  const flags = [];
  let score = 0;

  const accountAge = (Date.now() - new Date(userCreatedAt)) / (1000 * 60 * 60 * 24);
  if (accountAge < 1 && data.emergencyLevel === 'critical') {
    flags.push('new_account_critical_request');
    score += 30;
  }

  if (data.unitsRequired > 8) {
    flags.push('high_units_requested');
    score += 20;
  }

  const [recentRequests] = await pool.execute(
    `SELECT id FROM blood_requests WHERE requester_id = ? AND blood_group = ? AND created_at >= NOW() - INTERVAL 1 HOUR`,
    [userId, data.bloodGroup]
  );
  if (recentRequests.length > 0) {
    flags.push('duplicate_request');
    score += 40;
  }

  return {
    fakeDetectionScore: score,
    flags
  };
}

function getStatusNote(status) {
  const notes = {
    in_transit: 'Blood is on the way to the hospital.',
    at_hospital: 'Blood has reached the hospital.',
    completed: 'Blood transfusion completed successfully.',
    cancelled: 'Request was cancelled.'
  };
  return notes[status] || 'Status updated.';
}

function getStatusTitle(status) {
  const titles = {
    in_transit: '🚗 Blood In Transit',
    at_hospital: '🏥 Blood Reached Hospital',
    completed: '✅ Request Completed',
    cancelled: '❌ Request Cancelled'
  };
  return titles[status] || 'Status Updated';
}

async function awardBadges(requestId) {
  try {
    const [assigned] = await pool.execute(
      `SELECT d.user_id FROM assigned_donors ad JOIN donors d ON ad.donor_id = d.id WHERE ad.request_id = ? AND ad.status = 'donated' LIMIT 1`,
      [requestId]
    );
    
    if (assigned.length === 0) return;
    
    const userId = assigned[0].user_id;

    const [users] = await pool.execute('SELECT total_donations FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return;

    let donations = users[0].total_donations + 1;
    await pool.execute('UPDATE users SET total_donations = ? WHERE id = ?', [donations, userId]);
  } catch (e) { /* silent */ }
}
