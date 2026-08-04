const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');
const otpRepository = require('../repositories/otp.repository');
const { sendEmail } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');
const Logger = require('../utils/logger');

const generateToken = (id, roles) => {
  return jwt.sign({ id, roles }, process.env.JWT_SECRET, {
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
    Logger.info(`Registration attempt for email: ${email}`);

    // Check if email already exists (users table)
    const existingUser = await userRepository.findByEmail(email || null);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Check if phone already exists in user_profiles
    if (phone) {
      const existingPhone = await userRepository.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone already registered.' });
      }
    }

    // Hash password (retained in users.password for backward compat)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create auth user row
    const userId = await userRepository.createAuthUser({ name, email, emailVerified: false });

    // Store hashed password directly
    await userRepository.updateById(userId, { password: hashedPassword });

    // Create user profile
    await userRepository.upsertProfile(userId, {
      name: name || null,
      phone: phone || null,
      blood_group: (role === 'donor' && bloodGroup) ? bloodGroup : null
    });

    // Assign role
    const assignedRole = role || 'patient';
    await roleRepository.addRoleToUser(userId, assignedRole);

    // Generate and store OTP in otp_logs
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRepository.createOtp({
      userId,
      email,
      otp,
      purpose: 'email_verify',
      expiresAt: otpExpiresAt
    });

    // Create donor_profile row if registering as donor
    if (assignedRole === 'donor') {
      const donorRepository = require('../repositories/donor.repository');
      await donorRepository.createForUser(userId);
    }

    // Send OTP email
    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Verify Your Email',
      template: 'otp',
      data: { name, otp, purpose: 'Email Verification' }
    });

    const roles = await roleRepository.getRoleNamesForUser(userId);
    const token = generateToken(userId, roles);
    const newUser = await userRepository.findFullProfileById(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      token,
      user: newUser,
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

    const user = await userRepository.findByEmail(email || null);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'This account uses OTP login. Please use the OTP login flow.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    // Update last_seen
    await userRepository.updateById(user.id, { last_seen: new Date() });

    const roles = await roleRepository.getRoleNamesForUser(user.id);
    const token = generateToken(user.id, roles);
    const fullProfile = await userRepository.findFullProfileById(user.id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { ...fullProfile, roles }
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
    Logger.info(`OTP verification attempt for ${email}, purpose: ${purpose}`);

    const user = await userRepository.findByEmail(email || null);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const otpPurpose = purpose || 'email_verify';
    const { valid, record, reason } = await otpRepository.verifyOtp(email, otp, otpPurpose);

    if (!valid) {
      if (reason === 'expired') return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      if (reason === 'not_found') return res.status(400).json({ error: 'OTP not found. Please request a new OTP.' });
      return res.status(400).json({ error: 'Invalid OTP. Please check the code and try again.' });
    }

    // Consume the OTP
    await otpRepository.consumeOtp(record.id);

    if (otpPurpose === 'email_verify' || otpPurpose === 'signup') {
      await userRepository.markEmailVerified(user.id);
      // Notify in background — do not block verification
      try {
        await createNotification(user.id, {
          type: 'verification_approved',
          title: '✅ Account Verified!',
          body: 'Your Red Drop AI account is now verified.'
        });
      } catch {}
    }

    // Return fresh token so frontend can complete auth without re-login
    const roles = await roleRepository.getRoleNamesForUser(user.id);
    const token = generateToken(user.id, roles);
    const fullUser = await userRepository.findFullProfileById(user.id);

    Logger.info(`OTP verified successfully for ${email}`);
    res.json({ success: true, message: 'OTP verified successfully!', token, user: fullUser });
  } catch (error) {
    Logger.error('OTP verification error', { error: error.message });
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    const user = await userRepository.findByEmail(email || null);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otpPurpose = purpose || 'email_verify';

    // Invalidate any existing OTPs for this email+purpose
    await otpRepository.invalidatePreviousOtps(email, otpPurpose);

    await otpRepository.createOtp({
      userId: user.id,
      email,
      otp,
      purpose: otpPurpose,
      expiresAt: otpExpiresAt
    });

    const profile = await userRepository.findFullProfileById(user.id);

    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Your OTP Code',
      template: 'otp',
      data: { name: profile?.name || email, otp, purpose: otpPurpose }
    });

    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userRepository.findByEmail(email || null);
    if (!user) return res.status(404).json({ error: 'No account with that email.' });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate existing password_reset OTPs
    await otpRepository.invalidatePreviousOtps(email, 'password_reset');

    await otpRepository.createOtp({
      userId: user.id,
      email,
      otp,
      purpose: 'password_reset',
      expiresAt: otpExpiresAt
    });

    const profile = await userRepository.findFullProfileById(user.id);

    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Password Reset OTP',
      template: 'otp',
      data: { name: profile?.name || email, otp, purpose: 'Password Reset' }
    });

    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send reset email.' });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await userRepository.findByEmail(email || null);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { valid, record, reason } = await otpRepository.verifyOtp(email, otp, 'password_reset');

    if (!valid) {
      if (reason === 'expired') return res.status(400).json({ error: 'OTP has expired.' });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(user.id, { password: hashedPassword });
    await otpRepository.consumeOtp(record.id);

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await userRepository.findFullProfileById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
