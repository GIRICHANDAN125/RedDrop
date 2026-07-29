const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const roleRepository = require('../repositories/role.repository');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    if (!user.is_active) return res.status(403).json({ error: 'Account suspended.' });

    // Attach roles array and profile data to req.user
    const roles = await roleRepository.getRoleNamesForUser(user.id);
    req.user = { ...user, roles };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Authorize one or more roles. A user passes if they hold ANY of the listed roles.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${roles.join(', ')}.`
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

    const user = await userRepository.findById(decoded.id);
    if (user && user.is_active) {
      const roles = await roleRepository.getRoleNamesForUser(user.id);
      req.user = { ...user, roles };
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
