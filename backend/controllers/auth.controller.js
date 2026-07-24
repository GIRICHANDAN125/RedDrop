const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
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

    const [existingUsers] = await pool.execute(
      'SELECT id, email, phone FROM users WHERE email = ? OR phone = ?',
      [email || null, phone || null]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      return res.status(409).json({
        error: existingUser.email === email ? 'Email already registered.' : 'Phone already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password, role, blood_group, otp_code, otp_expires_at, otp_purpose) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name || null, email || null, phone || null, hashedPassword, role || 'receiver', (role === 'donor' && bloodGroup) ? bloodGroup : null, otp, otpExpiresAt, 'email_verify']
    );

    const userId = result.insertId;

    // Create donor profile if donor
    if (role === 'donor') {
      await pool.execute(
        'INSERT INTO donors (user_id) VALUES (?)',
        [userId]
      );
    }

    // Send OTP email
    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Verify Your Email',
      template: 'otp',
      data: { name, otp, purpose: 'Email Verification' }
    });

    const token = generateToken(userId, role);

    const [newUser] = await pool.execute('SELECT id, name, email, phone, role, blood_group, is_verified, is_active FROM users WHERE id = ?', [userId]);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify your email.',
      token,
      user: newUser[0],
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

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email || null]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account has been suspended.' });
    }

    await pool.execute('UPDATE users SET last_seen = NOW() WHERE id = ?', [user.id]);

    const token = generateToken(user.id, user.role);

    // Remove sensitive fields
    delete user.password;
    delete user.otp_code;
    delete user.otp_expires_at;
    delete user.otp_purpose;

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user
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

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email || null]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = users[0];

    if (!user.otp_code || user.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (purpose === 'email_verify') {
      await pool.execute(
        'UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL, otp_purpose = NULL WHERE id = ?',
        [user.id]
      );

      await createNotification(user.id, {
        type: 'verification_approved',
        title: '✅ Account Verified!',
        body: 'Your Red Drop AI account is now verified.'
      });
    } else {
      await pool.execute(
        'UPDATE users SET otp_code = NULL, otp_expires_at = NULL, otp_purpose = NULL WHERE id = ?',
        [user.id]
      );
    }

    res.json({ success: true, message: 'OTP verified successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed.' });
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    const [users] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email || null]);

    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = users[0];
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.execute(
      'UPDATE users SET otp_code = ?, otp_expires_at = ?, otp_purpose = ? WHERE id = ?',
      [otp, otpExpiresAt, purpose || 'email_verify', user.id]
    );

    await sendEmail({
      to: email,
      subject: '🩸 Red Drop AI - Your OTP Code',
      template: 'otp',
      data: { name: user.name, otp, purpose: purpose || 'email_verify' }
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
    const [users] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email || null]);

    if (users.length === 0) return res.status(404).json({ error: 'No account with that email.' });

    const user = users[0];
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.execute(
      'UPDATE users SET otp_code = ?, otp_expires_at = ?, otp_purpose = ? WHERE id = ?',
      [otp, otpExpiresAt, 'password_reset', user.id]
    );

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
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email || null]);

    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const user = users[0];

    if (!user.otp_code || user.otp_code !== otp || user.otp_purpose !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }
    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.execute(
      'UPDATE users SET password = ?, otp_code = NULL, otp_expires_at = NULL, otp_purpose = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, role, blood_group, is_verified, is_active FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
