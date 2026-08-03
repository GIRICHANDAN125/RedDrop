/**
 * HTTP Request Logging Middleware for RedDrop AI V2
 * Streams morgan HTTP logs through the structured logger.
 */
const morgan = require('morgan');
const logger = require('../utils/logger');

const stream = { write: (msg) => logger.info(msg.trim()) };

module.exports = morgan('combined', { stream });
