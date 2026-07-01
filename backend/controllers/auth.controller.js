const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const Donor = require('../models/Donor.model');
const { sendEmail } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role, bloodGroup } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({
        error: existingUser.email === email ? 'Email already registered.' : 'Phone already registered.'
      });
    }

    const otp = generateOTP();
    const user = await User.create({
      name, email, phone, password, role,
      bloodGroup: role === 'donor' ? bloodGroup : undefined,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        purpose: 'email_verify'
      }
    });

    // Create donor profile if donor
    if (role === 'donor') {
      await Donor.create({
        user: user._id,
        bloodGroup: bloodGroup || user.bloodGroup,
        location: user.location
      });
    }

    // Send OTP email
    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Verify Your Email',
      template: 'otp',
      data: { name, otp, purpose: 'Email Verification' }
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      token,
      user: user.toJSON(),
      requiresVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const user = await User.findOne({ email }).select('+otp');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.otp?.code || user.otp.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (purpose === 'email_verify') {
      user.isVerified = true;
      await createNotification(user._id, {
        type: 'verification_approved',
        title: '✅ Account Verified!',
        body: 'Your Red Drop AI account is now verified.'
      });
    }

    user.otp = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: purpose || 'email_verify'
    };
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Your OTP Code',
      template: 'otp',
      data: { name: user.name, otp, purpose }
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account with that email.' });

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      purpose: 'password_reset'
    };
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Password Reset OTP',
      template: 'otp',
      data: { name: user.name, otp, purpose: 'Password Reset' }
    });

    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+otp');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.otp?.code || user.otp.code !== otp || user.otp.purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired.' });
    }

    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
