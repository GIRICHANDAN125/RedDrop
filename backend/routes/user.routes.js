const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { pool } = require('../config/database');
const { upload } = require('../middleware/upload');
const { getSignedFileUrl, deleteS3Object } = require('../config/aws');

const hydrateAvatarUrl = async (user) => {
  if (!user) return user;

  if (user.avatar_public_id) {
    user.avatar_url = await getSignedFileUrl(user.avatar_public_id);
  }

  return user;
};

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    let address = typeof location === 'string' ? location : (location?.address || null);

    await pool.execute(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
      [name, phone, address, req.user.id]
    );

    const [rows] = await pool.execute('SELECT id, name, email, phone, role, avatar_url, avatar_public_id, address, city, state, pincode, is_active FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, user: await hydrateAvatarUrl(rows[0]) });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file.' });

    const [currentUsers] = await pool.execute(
      'SELECT avatar_public_id FROM users WHERE id = ?',
      [req.user.id]
    );

    const oldAvatarKey = currentUsers[0]?.avatar_public_id || null;
    const avatarKey = req.file.key;
    const avatarUrl = await getSignedFileUrl(avatarKey);

    await pool.execute(
      'UPDATE users SET avatar_url = ?, avatar_public_id = ? WHERE id = ?',
      [avatarUrl, avatarKey, req.user.id]
    );

    if (oldAvatarKey && oldAvatarKey !== avatarKey) {
      await deleteS3Object(oldAvatarKey).catch(error => {
        console.error('Failed to delete previous avatar from S3:', error.message);
      });
    }

    res.json({ success: true, avatar: { url: avatarUrl, key: avatarKey } });
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
