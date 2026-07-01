const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notification.service');

router.get('/', authenticate, async (req, res) => {
  try {
    const { page, limit, unreadOnly } = req.query;
    const data = await getUserNotifications(req.user._id, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === 'true'
    });
    res.json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

router.patch('/read', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    await markAsRead(req.user._id, ids);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await markAllAsRead(req.user._id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read.' });
  }
});

module.exports = router;
