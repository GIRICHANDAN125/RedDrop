const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) return res.status(401).json({ error: 'User not found.' });
    
    const user = rows[0];
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Role '${req.user.role}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (rows.length > 0) {
      req.user = rows[0];
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
