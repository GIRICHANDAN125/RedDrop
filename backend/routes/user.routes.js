const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const donorRepository = require('../repositories/donor.repository');
const patientRepository = require('../repositories/patient.repository');
const hospitalRepository = require('../repositories/hospital.repository');
const { upload } = require('../middleware/upload');
const { getSignedFileUrl, deleteS3Object } = require('../config/aws');

const hydrateAvatarUrl = async (user) => {
  if (!user) return user;
  if (user.avatar_public_id) {
    user.avatar_url = await getSignedFileUrl(user.avatar_public_id);
  }
  return user;
};

// GET /api/users/profile (full profile)
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await userRepository.findFullProfileById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    await hydrateAvatarUrl(user);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const address = typeof location === 'string' ? location : (location?.address || null);

    const profileUpdate = {};
    if (name !== undefined) profileUpdate.name = name;
    if (phone !== undefined) profileUpdate.phone = phone;
    if (address !== undefined) profileUpdate.address = address;

    if (Object.keys(profileUpdate).length > 0) {
      await userRepository.upsertProfile(req.user.id, profileUpdate);
    }

    const user = await userRepository.findFullProfileById(req.user.id);
    await hydrateAvatarUrl(user);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Update failed.' });
  }
});

// POST /api/users/avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file.' });

    const currentProfile = await userRepository.findFullProfileById(req.user.id);
    const oldAvatarKey = currentProfile?.avatar_public_id || null;

    const avatarKey = req.file.key;
    const avatarUrl = await getSignedFileUrl(avatarKey);

    await userRepository.upsertProfile(req.user.id, {
      avatar_url: avatarUrl,
      avatar_public_id: avatarKey
    });

    if (oldAvatarKey && oldAvatarKey !== avatarKey) {
      await deleteS3Object(oldAvatarKey).catch((error) => {
        console.error('Failed to delete previous avatar from S3:', error.message);
      });
    }

    res.json({ success: true, avatar: { url: avatarUrl, key: avatarKey } });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// PATCH /api/users/fcm-token
router.patch('/fcm-token', authenticate, async (req, res) => {
  try {
    await userRepository.updateById(req.user.id, { fcm_token: req.body.token || null });
    res.json({ success: true });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ error: 'Failed.' });
  }
});

// GET /api/users/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const user = await userRepository.findFullProfileById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const donorProfile = await donorRepository.findByUserId(req.user.id);

    res.json({
      success: true,
      stats: {
        totalDonations: donorProfile?.total_donations || 0,
        badges: [],
        rating: parseFloat(donorProfile?.response_rate) || 0,
        memberSince: user.created_at
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed.' });
  }
});

// POST /api/users/become-donor — add donor role and create donor_profile
router.post('/become-donor', authenticate, async (req, res) => {
  try {
    const added = await roleRepository.addRoleToUser(req.user.id, 'donor');
    if (added) {
      const existing = await donorRepository.findByUserId(req.user.id);
      if (!existing) {
        await donorRepository.createForUser(req.user.id);
      }
    }
    const roles = await roleRepository.getRoleNamesForUser(req.user.id);
    res.json({ success: true, message: 'Donor role activated.', roles });
  } catch (error) {
    console.error('Become donor error:', error);
    res.status(500).json({ error: 'Failed to activate donor role.' });
  }
});

// POST /api/users/become-patient — add patient role and create patient_profile
router.post('/become-patient', authenticate, async (req, res) => {
  try {
    const added = await roleRepository.addRoleToUser(req.user.id, 'patient');
    if (added) {
      const existing = await patientRepository.findByUserId(req.user.id);
      if (!existing) {
        await patientRepository.createForUser(req.user.id);
      }
    }
    const roles = await roleRepository.getRoleNamesForUser(req.user.id);
    res.json({ success: true, message: 'Patient role activated.', roles });
  } catch (error) {
    console.error('Become patient error:', error);
    res.status(500).json({ error: 'Failed to activate patient role.' });
  }
});

// POST /api/users/become-hospital — add hospital role and create hospital_profile
router.post('/become-hospital', authenticate, async (req, res) => {
  try {
    const { hospitalName, registrationNumber, address, city, state, pincode, contactNumber } = req.body;

    if (!hospitalName) {
      return res.status(400).json({ error: 'Hospital name is required.' });
    }

    const added = await roleRepository.addRoleToUser(req.user.id, 'hospital');
    if (added) {
      const existing = await hospitalRepository.findByUserId(req.user.id);
      if (!existing) {
        await hospitalRepository.createForUser(req.user.id, {
          hospital_name: hospitalName,
          registration_number: registrationNumber || null,
          address: address || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          contact_number: contactNumber || null
        });
      }
    }

    const roles = await roleRepository.getRoleNamesForUser(req.user.id);
    res.json({ success: true, message: 'Hospital role activated.', roles });
  } catch (error) {
    console.error('Become hospital error:', error);
    res.status(500).json({ error: 'Failed to activate hospital role.' });
  }
});

module.exports = router;
