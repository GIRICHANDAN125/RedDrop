const Donor = require('../models/Donor.model');
const User = require('../models/User.model');
const { priorityQueue } = require('../utils/dsa.utils');

// GET /api/donors/nearby
// DSA: Uses MongoDB geospatial index (Graph-based nearest neighbor search)
exports.getNearbyDonors = async (req, res) => {
  try {
    const {
      latitude, longitude,
      bloodGroup,
      maxDistance = 20000, // meters (20km default)
      limit = 20
    } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location coordinates required.' });
    }

    // Build blood group compatibility query
    // DSA: Uses hash map for O(1) compatible type lookup
    const compatibleGroups = getCompatibleBloodGroups(bloodGroup);

    const query = {
      'availability.isAvailable': true,
      'medicalHistory.isFitToDonate': true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (bloodGroup) {
      query.bloodGroup = { $in: compatibleGroups };
    }

    const donors = await Donor.find(query)
      .limit(parseInt(limit))
      .populate('user', 'name phone avatar rating totalDonations badges lastSeen')
      .lean();

    // DSA: Priority Queue sort by urgency score (distance + response rate + availability)
    const scoredDonors = donors.map(donor => ({
      ...donor,
      score: calculateDonorScore(donor, parseFloat(latitude), parseFloat(longitude))
    }));

    // Sort by score descending (best match first)
    scoredDonors.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      count: scoredDonors.length,
      donors: scoredDonors
    });
  } catch (error) {
    console.error('Nearby donors error:', error);
    res.status(500).json({ error: 'Failed to fetch nearby donors.' });
  }
};

// GET /api/donors/search
// DSA: Trie-like prefix search via MongoDB regex + sorting
exports.searchDonors = async (req, res) => {
  try {
    const { query, bloodGroup, city, state, available } = req.query;

    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');
    if (available === 'true') filter['availability.isAvailable'] = true;

    let donorQuery = Donor.find(filter)
      .populate({
        path: 'user',
        select: 'name phone avatar rating totalDonations badges',
        ...(query ? { match: { name: new RegExp(query, 'i') } } : {})
      })
      .limit(50);

    const donors = await donorQuery.lean();
    const filtered = donors.filter(d => d.user !== null);

    res.json({ success: true, count: filtered.length, donors: filtered });
  } catch (error) {
    res.status(500).json({ error: 'Search failed.' });
  }
};

// GET /api/donors/profile
exports.getMyDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id })
      .populate('user', '-password -otp');

    if (!donor) return res.status(404).json({ error: 'Donor profile not found.' });
    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donor profile.' });
  }
};

// PUT /api/donors/profile
exports.updateDonorProfile = async (req, res) => {
  try {
    const updates = req.body;
    const donor = await Donor.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', '-password -otp');

    if (!donor) return res.status(404).json({ error: 'Donor profile not found.' });

    // Check profile completeness
    donor.isProfileComplete = checkProfileComplete(donor);
    await donor.save();

    res.json({ success: true, message: 'Profile updated!', donor });
  } catch (error) {
    res.status(500).json({ error: 'Update failed.' });
  }
};

// PUT /api/donors/availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable, nextAvailableDate } = req.body;
    const donor = await Donor.findOneAndUpdate(
      { user: req.user._id },
      {
        'availability.isAvailable': isAvailable,
        ...(nextAvailableDate && { 'availability.nextAvailableDate': nextAvailableDate })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `You are now ${isAvailable ? 'available' : 'unavailable'} for donation.`,
      availability: donor.availability
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability.' });
  }
};

// GET /api/donors/:id
exports.getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate('user', 'name avatar rating totalDonations badges');

    if (!donor) return res.status(404).json({ error: 'Donor not found.' });
    res.json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donor.' });
  }
};

// ----- Helper DSA Functions -----

// DSA: Hash map for blood group compatibility O(1)
const bloodCompatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

// Returns donor groups that CAN donate to the requested group
function getCompatibleBloodGroups(recipientGroup) {
  if (!recipientGroup) return Object.keys(bloodCompatibility);
  return Object.entries(bloodCompatibility)
    .filter(([, canDonateTo]) => canDonateTo.includes(recipientGroup))
    .map(([group]) => group);
}

// DSA: Scoring function (multi-criteria optimization)
function calculateDonorScore(donor, lat, lng) {
  const [dLng, dLat] = donor.location.coordinates;
  const distance = getDistanceKm(lat, lng, dLat, dLng);
  const distanceScore = Math.max(0, 100 - (distance * 5));
  const responseScore = donor.stats?.responseRate || 50;
  const lastDonationScore = donor.medicalHistory?.lastDonationDate
    ? Math.min(100, (Date.now() - new Date(donor.medicalHistory.lastDonationDate)) / (1000 * 60 * 60 * 24))
    : 100;

  return (distanceScore * 0.5) + (responseScore * 0.3) + (lastDonationScore * 0.2);
}

// Haversine formula for distance
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkProfileComplete(donor) {
  return !!(
    donor.bloodGroup &&
    donor.location?.city &&
    donor.medicalHistory?.weight &&
    donor.medicalHistory?.age &&
    donor.emergencyContact?.phone
  );
}
