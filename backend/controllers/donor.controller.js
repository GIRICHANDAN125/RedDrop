const { pool } = require('../config/database');
const { priorityQueue } = require('../utils/dsa.utils');

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

    let sql = `
      SELECT d.*, u.name, u.phone, u.avatar_url, u.rating_average, u.total_donations, u.last_seen, u.location_lat, u.location_lng,
             (6371 * acos(cos(radians(?)) * cos(radians(u.location_lat)) * cos(radians(u.location_lng) - radians(?)) + sin(radians(?)) * sin(radians(u.location_lat)))) AS distance
      FROM donors d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_available = 1 AND d.is_fit_to_donate = 1
    `;
    
    let params = [parseFloat(latitude), parseFloat(longitude), parseFloat(latitude)];

    if (bloodGroup && compatibleGroups.length > 0) {
      const placeholders = compatibleGroups.map(() => '?').join(',');
      sql += ` AND u.blood_group IN (${placeholders})`;
      params.push(...compatibleGroups);
    }

    sql += ` HAVING distance <= ? ORDER BY distance ASC LIMIT ?`;
    params.push(maxDistanceKm, parseInt(limit));

    const [donors] = await pool.execute(sql, params);

    // DSA: Priority Queue sort by urgency score (distance + response rate + availability)
    const scoredDonors = donors.map(donor => ({
      ...donor,
      score: calculateDonorScore(donor, donor.distance)
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
exports.searchDonors = async (req, res) => {
  try {
    const { query, bloodGroup, city, state, available } = req.query;

    let sql = `
      SELECT d.*, u.name, u.phone, u.avatar_url, u.rating_average, u.total_donations
      FROM donors d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (bloodGroup) {
      sql += ` AND u.blood_group = ?`;
      params.push(bloodGroup);
    }
    if (city) {
      sql += ` AND u.city LIKE ?`;
      params.push(`%${city}%`);
    }
    if (state) {
      sql += ` AND u.state LIKE ?`;
      params.push(`%${state}%`);
    }
    if (available === 'true') {
      sql += ` AND d.is_available = 1`;
    }
    if (query) {
      sql += ` AND u.name LIKE ?`;
      params.push(`%${query}%`);
    }

    sql += ` LIMIT 50`;

    const [donors] = await pool.execute(sql, params);

    res.json({ success: true, count: donors.length, donors });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed.' });
  }
};

// GET /api/donors/profile
exports.getMyDonorProfile = async (req, res) => {
  try {
    const [donors] = await pool.execute(
      'SELECT d.*, u.name, u.email, u.phone, u.blood_group, u.city FROM donors d JOIN users u ON d.user_id = u.id WHERE d.user_id = ?',
      [req.user.id]
    );

    if (donors.length === 0) return res.status(404).json({ error: 'Donor profile not found.' });
    res.json({ success: true, donor: donors[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donor profile.' });
  }
};

// PUT /api/donors/profile
exports.updateDonorProfile = async (req, res) => {
  try {
    const { hemoglobin_level, weight, age, emergency_contact_phone, city, blood_group } = req.body;
    
    let is_profile_complete = (blood_group && city && weight && age && emergency_contact_phone) ? 1 : 0;

    await pool.execute(
      `UPDATE donors SET hemoglobin_level = ?, weight = ?, age = ?, emergency_contact_phone = ?, is_profile_complete = ? WHERE user_id = ?`,
      [hemoglobin_level, weight, age, emergency_contact_phone, is_profile_complete, req.user.id]
    );

    if (city || blood_group) {
      await pool.execute(
        'UPDATE users SET city = COALESCE(?, city), blood_group = COALESCE(?, blood_group) WHERE id = ?',
        [city, blood_group, req.user.id]
      );
    }

    const [donors] = await pool.execute(
      'SELECT d.*, u.name, u.city, u.blood_group FROM donors d JOIN users u ON d.user_id = u.id WHERE d.user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, message: 'Profile updated!', donor: donors[0] });
  } catch (error) {
    res.status(500).json({ error: 'Update failed.' });
  }
};

// PUT /api/donors/availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const isAvailInt = isAvailable ? 1 : 0;
    
    await pool.execute(
      'UPDATE donors SET is_available = ? WHERE user_id = ?',
      [isAvailInt, req.user.id]
    );

    const [donors] = await pool.execute('SELECT is_available FROM donors WHERE user_id = ?', [req.user.id]);

    res.json({
      success: true,
      message: `You are now ${isAvailable ? 'available' : 'unavailable'} for donation.`,
      availability: donors[0].is_available === 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability.' });
  }
};

// GET /api/donors/:id
exports.getDonorById = async (req, res) => {
  try {
    const [donors] = await pool.execute(
      'SELECT d.*, u.name, u.avatar_url, u.rating_average, u.total_donations FROM donors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [req.params.id]
    );

    if (donors.length === 0) return res.status(404).json({ error: 'Donor not found.' });
    res.json({ success: true, donor: donors[0] });
  } catch (error) {
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
