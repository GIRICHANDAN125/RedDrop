/**
 * Global Error Handling Middleware for RedDrop AI V2 (RFC 7807)
 */
const ResponseUtil = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('💥 Unhandled Exception:', err);

  const statusCode = err.statusCode || err.status || 500;
  const errorType = err.type || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');
  const message = err.message || 'An unexpected error occurred on the server.';
  const details = err.details || (process.env.NODE_ENV === 'development' ? [{ stack: err.stack }] : []);

  return ResponseUtil.error(res, {
    code: statusCode,
    type: errorType,
    message,
    details
  });
};

module.exports = errorHandler;
