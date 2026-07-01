const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const { upload } = require('../middleware/upload.middleware');

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, location },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Update failed.' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file.' });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url: req.file.secure_url, publicId: req.file.public_id } },
      { new: true }
    );
    res.json({ success: true, avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// Update FCM token
router.patch('/fcm-token', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: req.body.token });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed.' });
  }
});

// Get user stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      stats: {
        totalDonations: user.totalDonations,
        badges: user.badges,
        rating: user.rating,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed.' });
  }
});

module.exports = router;
