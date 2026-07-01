const express = require('express');
const router = express.Router();
const {
  getNearbyDonors, searchDonors, getMyDonorProfile,
  updateDonorProfile, toggleAvailability, getDonorById
} = require('../controllers/donor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/nearby', getNearbyDonors);
router.get('/search', searchDonors);
router.get('/profile', authenticate, authorize('donor'), getMyDonorProfile);
router.put('/profile', authenticate, authorize('donor'), updateDonorProfile);
router.put('/availability', authenticate, authorize('donor'), toggleAvailability);
router.get('/:id', getDonorById);

module.exports = router;
