/**
 * Test Helper Utilities for RedDrop AI V2
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_key_12345';

const generateTestToken = (payload = {}) => {
  const defaultPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'donor',
    ...payload
  };
  return jwt.sign(defaultPayload, JWT_SECRET, { expiresIn: '1h' });
};

const generateExpiredToken = (payload = {}) => {
  const defaultPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'donor',
    ...payload
  };
  return jwt.sign(defaultPayload, JWT_SECRET, { expiresIn: '-1s' });
};

module.exports = {
  generateTestToken,
  generateExpiredToken,
  JWT_SECRET
};
