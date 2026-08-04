const express = require('express');
const router = express.Router();
const { pool } = require('../../config/database');
const ResponseUtil = require('../../utils/response');

// GET /api/v2/community/leaderboard
router.get('/leaderboard', async (req, res, next) => {
  try {
    const [donors] = await pool.query(
      `SELECT dp.id, dp.total_donations, dp.lives_saved, up.name, up.blood_group, up.avatar_url, up.city
       FROM donor_profiles dp
       JOIN user_profiles up ON dp.user_id = up.user_id
       ORDER BY dp.total_donations DESC, dp.lives_saved DESC
       LIMIT 10`
    );

    const [stats] = await pool.query(
      `SELECT COUNT(*) as total_donors, SUM(total_donations) as total_donations, SUM(lives_saved) as lives_saved FROM donor_profiles`
    );

    return ResponseUtil.success(res, {
      message: 'Leaderboard retrieved successfully.',
      data: {
        topDonors: donors,
        communityStats: stats[0] || { total_donors: 0, total_donations: 0, lives_saved: 0 }
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
