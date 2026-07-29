const requestRepository = require('../repositories/request.repository');
const responseRepository = require('../repositories/response.repository');
const timelineRepository = require('../repositories/timeline.repository');
const notificationRepository = require('../repositories/notification.repository');
const donorRepository = require('../repositories/donor.repository');
const userRepository = require('../repositories/user.repository');
const { createNotification, notifyNearbyDonors } = require('../services/notification.service');
const { verifyMedicalReport } = require('../services/aiVerification.service');
const { emitToRequest, emitToUser } = require('../config/socket');
const { getSignedFileUrl } = require('../config/aws');

const hydrateAvatarUrls = async (rows, urlField, keyField) => {
  return Promise.all(rows.map(async (row) => {
    if (row?.[keyField]) {
      row[urlField] = await getSignedFileUrl(row[keyField]);
    }
    return row;
  }));
};

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

    const userAuthRow = await userRepository.findById(req.user.id);

    // AI fake detection pre-check
    const aiAnalysis = await analyzeRequest(req.body, req.user.id, userAuthRow?.created_at);

    if (aiAnalysis.fakeDetectionScore > 80) {
      return res.status(422).json({
        error: 'Request flagged as suspicious. Please contact support.',
        flags: aiAnalysis.flags
      });
    }

    const requestId = generateRequestId();
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const newRequestDbId = await requestRepository.create({
      request_id: requestId,
      requester_id: req.user.id,
      patient_name: patientName,
      blood_group: bloodGroup,
      units_required: unitsRequired,
      emergency_level: emergencyLevel,
      hospital_name: hospital?.name || null,
      hospital_address: hospital?.address || null,
      hospital_city: hospital?.city || null,
      hospital_state: hospital?.state || null,
      hospital_pincode: hospital?.pincode || null,
      hospital_contact_number: hospital?.contactNumber || hospital?.contact_number || null,
      hospital_lat: hospital?.lat || hospital?.location?.lat || null,
      hospital_lng: hospital?.lng || hospital?.location?.lng || null,
      status: 'searching',
      expires_at: expiresAt,
      notes: notes || null,
      is_anonymous: isAnonymous ? 1 : 0
    });

    // Create initial timeline entry
    await timelineRepository.addEntry({
      requestId: newRequestDbId,
      status: 'pending',
      note: 'Request created',
      updatedBy: req.user.id
    });

    // Async: find and notify nearby donors
    await processRequestAsync(newRequestDbId);

    const request = await requestRepository.findById(newRequestDbId);

    res.status(201).json({
      success: true,
      message: 'Blood request created! Searching for donors...',
      request
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

    const userRoles = req.user?.roles || [];
    let requesterId = null;
    let donorBloodGroup = null;

    if (userRoles.includes('patient') && !userRoles.includes('admin')) {
      requesterId = req.user.id;
    } else if (userRoles.includes('donor') && !userRoles.includes('admin') && !userRoles.includes('patient')) {
      const donorProfile = await donorRepository.findFullProfileByUserId(req.user.id);
      donorBloodGroup = donorProfile?.blood_group || null;
    }

    const { rows, total } = await requestRepository.findFiltered({
      requesterId,
      donorBloodGroup,
      status,
      bloodGroup,
      emergencyLevel,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    await hydrateAvatarUrls(rows, 'requester_avatar', 'requester_avatar_key');

    res.json({
      success: true,
      requests: rows,
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
    const request = await requestRepository.findWithRequester(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const responses = await responseRepository.getResponsesForRequest(req.params.id);

    if (request.requester_avatar_key) {
      request.requester_avatar = await getSignedFileUrl(request.requester_avatar_key);
    }
    request.assignedDonors = responses;

    res.json({ success: true, request });
  } catch (error) {
    console.error('Get request by id error:', error);
    res.status(500).json({ error: 'Failed to fetch request.' });
  }
};

// POST /api/requests/:id/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'

    const request = await requestRepository.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const donorProfile = await donorRepository.findByUserId(req.user.id);
    if (!donorProfile) return res.status(404).json({ error: 'Donor profile not found.' });

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    await responseRepository.upsertResponse({
      requestId: request.id,
      donorProfileId: donorProfile.id,
      units: Math.min(1, request.units_required - request.units_fulfilled),
      status: newStatus,
      acceptedAt: action === 'accept' ? new Date() : null
    });

    if (action === 'accept') {
      await requestRepository.updateStatus(request.id, 'donor_found');

      const profile = await userRepository.findFullProfileById(req.user.id);
      const donorName = profile?.name || 'A donor';

      await timelineRepository.addEntry({
        requestId: request.id,
        status: 'donor_found',
        note: `Donor ${donorName} accepted the request`,
        updatedBy: req.user.id
      });

      await createNotification(request.requester_id, {
        type: 'donor_found',
        title: '🎉 Donor Found!',
        body: `${donorName} has accepted your blood request.`,
        data: { requestId: request.id }
      });

      emitToRequest(request.id.toString(), 'request:updated', { status: 'donor_found' });
      emitToUser(request.requester_id.toString(), 'donor:accepted', { requestId: request.id });
    }

    // Update donor response stats
    const reqAccepted = donorProfile.requests_accepted + (action === 'accept' ? 1 : 0);
    const reqDeclined = donorProfile.requests_declined + (action === 'decline' ? 1 : 0);
    const responseRate = Math.round((reqAccepted / (reqAccepted + reqDeclined)) * 100) || 100;

    await donorRepository.updateByUserId(req.user.id, {
      requests_accepted: reqAccepted,
      requests_declined: reqDeclined,
      response_rate: responseRate
    });

    res.json({ success: true, message: `Request ${action}ed successfully.` });
  } catch (error) {
    console.error('Respond to request error:', error);
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

    const request = await requestRepository.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const isCompleted = status === 'completed';
    const fulfilledUnits = isCompleted ? request.units_required : request.units_fulfilled;

    await requestRepository.updateStatus(request.id, status, fulfilledUnits);

    await timelineRepository.addEntry({
      requestId: request.id,
      status,
      note: note || getStatusNote(status),
      updatedBy: req.user.id
    });

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
    console.error('Update request status error:', error);
    res.status(500).json({ error: 'Failed to update status.' });
  }
};

// POST /api/requests/:id/upload-report
exports.uploadMedicalReport = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const reportUrl = await getSignedFileUrl(req.file.key);
    const aiVerification = await verifyMedicalReport(reportUrl);

    res.json({
      success: true,
      message: 'Medical report uploaded and analyzed.',
      verification: aiVerification,
      report: {
        url: reportUrl,
        key: req.file.key
      }
    });
  } catch (error) {
    console.error('Upload report error:', error);
    res.status(500).json({ error: 'Upload failed.' });
  }
};

// --- Helpers ---

async function processRequestAsync(requestId) {
  setTimeout(async () => {
    try {
      const request = await requestRepository.findById(requestId);
      if (!request) return;

      if (request.hospital_lat && request.hospital_lng) {
        const nearbyDonors = await donorRepository.findNearbyDonors({
          lat: request.hospital_lat,
          lng: request.hospital_lng,
          bloodGroups: [request.blood_group],
          maxDistanceKm: 30,
          limit: 15
        });
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

  const isDuplicate = await requestRepository.findRecentDuplicate(userId, data.bloodGroup);
  if (isDuplicate) {
    flags.push('duplicate_request');
    score += 40;
  }

  return { fakeDetectionScore: score, flags };
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
    const donated = await responseRepository.findDonatedForRequest(requestId);
    if (!donated || donated.length === 0) return;

    const { user_id: userId } = donated[0];
    await donorRepository.recordDonation(userId);
  } catch (e) { /* silent */ }
}
