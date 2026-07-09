const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');
const { upload } = require('../middleware/upload.middleware');

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    let address = typeof location === 'string' ? location : (location?.address || null);

    await pool.execute(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
      [name, phone, address, req.user.id]
    );

    const [rows] = await pool.execute('SELECT id, name, email, phone, role, avatar_url, address, city, state, pincode, is_active FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file.' });

    const avatarUrl = req.file.secure_url;
    const publicId = req.file.public_id;

    await pool.execute(
      'UPDATE users SET avatar_url = ?, avatar_public_id = ? WHERE id = ?',
      [avatarUrl, publicId, req.user.id]
    );

    res.json({ success: true, avatar: { url: avatarUrl, publicId } });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// Update FCM token
router.patch('/fcm-token', authenticate, async (req, res) => {
  try {
    await pool.execute('UPDATE users SET fcm_token = ? WHERE id = ?', [req.body.token || null, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Failed.' });
  }
});

// Get user stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT total_donations, rating_average, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    const user = rows[0];

    res.json({
      success: true,
      stats: {
        totalDonations: user.total_donations,
        badges: [], // Mocked badges for now
        rating: parseFloat(user.rating_average) || 0,
        memberSince: user.created_at
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed.' });
  }
});

module.exports = router;
