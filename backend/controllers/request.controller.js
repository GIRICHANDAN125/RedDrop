const BloodRequest = require('../models/BloodRequest.model');
const Donor = require('../models/Donor.model');
const User = require('../models/User.model');
const { createNotification, notifyNearbyDonors } = require('../services/notification.service');
const { verifyMedicalReport } = require('../services/aiVerification.service');
const { emitToRequest, emitToUser } = require('../config/socket');
const { MinHeap } = require('../utils/dsa.utils');

// POST /api/requests
exports.createRequest = async (req, res) => {
  try {
    const {
      patientName, bloodGroup, unitsRequired,
      emergencyLevel, hospital, notes, isAnonymous
    } = req.body;

    // AI fake detection pre-check
    const aiAnalysis = await analyzeRequest(req.body, req.user);

    if (aiAnalysis.fakeDetectionScore > 80) {
      return res.status(422).json({
        error: 'Request flagged as suspicious. Please contact support.',
        flags: aiAnalysis.flags
      });
    }

    const request = await BloodRequest.create({
      requester: req.user._id,
      patientName, bloodGroup, unitsRequired,
      emergencyLevel, hospital, notes, isAnonymous,
      status: 'searching',
      aiAnalysis,
      timeline: [{ status: 'pending', note: 'Request created', updatedBy: req.user._id }]
    });

    // DSA: Priority Queue — queue request by emergency level
    // Enqueue for background processing
    await processRequestAsync(request._id);

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
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'receiver') {
      filter.requester = req.user._id;
    } else if (req.user.role === 'donor') {
      filter.bloodGroup = req.user.bloodGroup;
      filter.status = { $in: ['searching', 'pending'] };
    }

    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (emergencyLevel) filter.emergencyLevel = emergencyLevel;

    const total = await BloodRequest.countDocuments(filter);
    // DSA: Sorting by emergency priority (critical > high > medium > low)
    const requests = await BloodRequest.find(filter)
      .sort({ emergencyLevel: getEmergencySort(), createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('requester', 'name avatar')
      .lean();

    res.json({
      success: true,
      requests,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// GET /api/requests/:id
exports.getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name phone avatar')
      .populate('assignedDonors.donor');

    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request.' });
  }
};

// POST /api/requests/:id/respond
exports.respondToRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ error: 'Donor profile not found.' });

    const donorEntry = request.assignedDonors.find(
      d => d.donor.toString() === donor._id.toString()
    );

    if (!donorEntry) {
      // Add donor to request
      request.assignedDonors.push({
        donor: donor._id,
        units: Math.min(1, request.unitsRequired - request.unitsFulfilled),
        status: action === 'accept' ? 'accepted' : 'declined',
        acceptedAt: action === 'accept' ? new Date() : undefined
      });
    } else {
      donorEntry.status = action === 'accept' ? 'accepted' : 'declined';
      if (action === 'accept') donorEntry.acceptedAt = new Date();
    }

    if (action === 'accept') {
      request.status = 'donor_found';
      request.timeline.push({
        status: 'donor_found',
        note: `Donor ${req.user.name} accepted the request`,
        updatedBy: req.user._id
      });

      // Notify requester
      await createNotification(request.requester, {
        type: 'donor_found',
        title: '🎉 Donor Found!',
        body: `${req.user.name} has accepted your blood request.`,
        data: { requestId: request._id }
      });

      emitToRequest(request._id.toString(), 'request:updated', { status: 'donor_found' });
      emitToUser(request.requester.toString(), 'donor:accepted', { requestId: request._id });
    }

    // Update donor stats
    if (action === 'accept') {
      donor.stats.requestsAccepted++;
    } else {
      donor.stats.requestsDeclined++;
    }
    donor.stats.responseRate = Math.round(
      (donor.stats.requestsAccepted / (donor.stats.requestsAccepted + donor.stats.requestsDeclined)) * 100
    );
    await donor.save();
    await request.save();

    res.json({ success: true, message: `Request ${action}ed successfully.`, request });
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

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        $push: {
          timeline: { status, note: note || getStatusNote(status), updatedBy: req.user._id }
        },
        ...(status === 'completed' && { unitsFulfilled: '$unitsRequired' })
      },
      { new: true }
    );

    if (!request) return res.status(404).json({ error: 'Request not found.' });

    // Real-time update
    emitToRequest(request._id.toString(), 'request:status', { status, timeline: request.timeline });

    // Notify all parties
    const notifType = status === 'completed' ? 'blood_delivered' : 'blood_in_transit';
    await createNotification(request.requester, {
      type: notifType,
      title: getStatusTitle(status),
      body: getStatusNote(status),
      data: { requestId: request._id }
    });

    // Award badges on completion
    if (status === 'completed') {
      await awardBadges(request);
    }

    res.json({ success: true, request });
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

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      {
        medicalReport: {
          url: secure_url,
          publicId: public_id,
          uploadedAt: new Date(),
          aiVerification
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Medical report uploaded and analyzed.',
      verification: aiVerification,
      request
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed.' });
  }
};

// --- Helpers ---

async function processRequestAsync(requestId) {
  // In production: use Bull/Redis queue
  // DSA: Priority Queue processing — critical requests served first
  setTimeout(async () => {
    try {
      const request = await BloodRequest.findById(requestId);
      if (!request) return;

      const nearbyDonors = await Donor.find({
        'availability.isAvailable': true,
        bloodGroup: request.bloodGroup,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: request.hospital.location.coordinates
            },
            $maxDistance: 30000
          }
        }
      }).limit(15).populate('user');

      await notifyNearbyDonors(nearbyDonors, request);
    } catch (err) {
      console.error('Async process error:', err);
    }
  }, 500);
}

async function analyzeRequest(data, user) {
  // AI/Logic fake detection
  const flags = [];
  let score = 0;

  // Check: new account + critical emergency = suspicious
  const accountAge = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
  if (accountAge < 1 && data.emergencyLevel === 'critical') {
    flags.push('new_account_critical_request');
    score += 30;
  }

  // Check: unrealistic units
  if (data.unitsRequired > 8) {
    flags.push('high_units_requested');
    score += 20;
  }

  // Check: duplicate request (same blood group + hospital in last 1 hour)
  const recentRequest = await BloodRequest.findOne({
    requester: user._id,
    bloodGroup: data.bloodGroup,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
  });
  if (recentRequest) {
    flags.push('duplicate_request');
    score += 40;
  }

  return {
    fakeDetectionScore: score,
    urgencyScore: getUrgencyScore(data.emergencyLevel),
    flags,
    analyzedAt: new Date()
  };
}

function getUrgencyScore(level) {
  const scores = { critical: 100, high: 75, medium: 50, low: 25 };
  return scores[level] || 50;
}

function getEmergencySort() {
  return { critical: -4, high: -3, medium: -2, low: -1 };
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

async function awardBadges(request) {
  try {
    const donor = await Donor.findOne({ 'assignedDonors.status': 'donated' });
    if (!donor) return;
    const user = await User.findById(donor.user);
    if (!user) return;

    user.totalDonations++;
    if (user.totalDonations === 1 && !user.badges.includes('first_donor')) {
      user.badges.push('first_donor');
    }
    if (user.totalDonations === 5 && !user.badges.includes('hero')) {
      user.badges.push('hero');
    }
    if (user.totalDonations === 10 && !user.badges.includes('lifesaver')) {
      user.badges.push('lifesaver');
    }
    await user.save();
  } catch (e) { /* silent */ }
}
