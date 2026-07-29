const donorRepository = require('../repositories/donor.repository');
const userRepository = require('../repositories/user.repository');
const { getSignedFileUrl } = require('../config/aws');

const hydrateDonorAvatars = async (donors) => {
  return Promise.all(donors.map(async (donor) => {
    if (donor?.avatar_public_id) {
      donor.avatar_url = await getSignedFileUrl(donor.avatar_public_id);
    }
    return donor;
  }));
};

// GET /api/donors/nearby
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

    const maxDistanceKm = maxDistance / 1000;
    const compatibleGroups = getCompatibleBloodGroups(bloodGroup);

    const donors = await donorRepository.findNearbyDonors({
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      bloodGroups: compatibleGroups,
      maxDistanceKm,
      limit: parseInt(limit)
    });

    await hydrateDonorAvatars(donors);

    // DSA: Score donors by urgency (distance + response rate + availability)
    const scoredDonors = donors.map(donor => ({
      ...donor,
      score: calculateDonorScore(donor, donor.distance)
    }));

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
exports.searchDonors = async (req, res) => {
  try {
    const { query, bloodGroup, city, state, available } = req.query;

    const donors = await donorRepository.searchDonors({
      bloodGroup,
      city,
      state,
      available,
      query,
      limit: 50
    });

    await hydrateDonorAvatars(donors);

    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed.' });
  }
};

// GET /api/donors/profile
exports.getMyDonorProfile = async (req, res) => {
  try {
    const donor = await donorRepository.findFullProfileByUserId(req.user.id);
    if (!donor) return res.status(404).json({ error: 'Donor profile not found.' });
    res.json({ success: true, donor });
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({ error: 'Failed to fetch donor profile.' });
  }
};

// PUT /api/donors/profile
exports.updateDonorProfile = async (req, res) => {
  try {
    const { hemoglobin_level, weight, age, emergency_contact_phone, city, blood_group } = req.body;

    const is_profile_complete = (blood_group && city && weight && age && emergency_contact_phone) ? true : false;

    await donorRepository.updateByUserId(req.user.id, {
      ...(hemoglobin_level !== undefined && { hemoglobin_level }),
      ...(weight !== undefined && { weight }),
      ...(age !== undefined && { age }),
      is_profile_complete
    });

    // Update emergency_contact_phone and location fields in user_profiles
    const profileUpdate = {};
    if (emergency_contact_phone) profileUpdate.emergency_contact_phone = emergency_contact_phone;
    if (city) profileUpdate.city = city;
    if (blood_group) profileUpdate.blood_group = blood_group;

    if (Object.keys(profileUpdate).length > 0) {
      await userRepository.upsertProfile(req.user.id, profileUpdate);
    }

    const donor = await donorRepository.findFullProfileByUserId(req.user.id);

    res.json({ success: true, message: 'Profile updated!', donor });
  } catch (error) {
    console.error('Update donor profile error:', error);
    res.status(500).json({ error: 'Update failed.' });
  }
};

// PUT /api/donors/availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    await donorRepository.updateByUserId(req.user.id, {
      is_available: isAvailable ? 1 : 0
    });

    const donor = await donorRepository.findByUserId(req.user.id);

    res.json({
      success: true,
      message: `You are now ${isAvailable ? 'available' : 'unavailable'} for donation.`,
      availability: donor?.is_available === 1
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to update availability.' });
  }
};

// GET /api/donors/:id
exports.getDonorById = async (req, res) => {
  try {
    const donor = await donorRepository.findFullProfileById(req.params.id);
    if (!donor) return res.status(404).json({ error: 'Donor not found.' });

    await hydrateDonorAvatars([donor]);
    res.json({ success: true, donor });
  } catch (error) {
    console.error('Get donor by id error:', error);
    res.status(500).json({ error: 'Failed to fetch donor.' });
  }
};

// ----- Helper DSA Functions -----

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

function getCompatibleBloodGroups(recipientGroup) {
  if (!recipientGroup) return Object.keys(bloodCompatibility);
  return Object.entries(bloodCompatibility)
    .filter(([, canDonateTo]) => canDonateTo.includes(recipientGroup))
    .map(([group]) => group);
}

function calculateDonorScore(donor, distance) {
  const distanceScore = Math.max(0, 100 - (distance * 5));
  const responseScore = donor.response_rate || 50;
  const lastDonationScore = donor.last_donation_date
    ? Math.min(100, (Date.now() - new Date(donor.last_donation_date)) / (1000 * 60 * 60 * 24))
    : 100;

  return (distanceScore * 0.5) + (responseScore * 0.3) + (lastDonationScore * 0.2);
}
