/**
 * Structured Logging Engine for RedDrop AI V2
 */

const LOG_LEVELS = { info: 'INFO', warn: 'WARN', error: 'ERROR', debug: 'DEBUG' };

class Logger {
  static _formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      meta
    });
  }

  static info(message, meta) {
    console.log(this._formatMessage(LOG_LEVELS.info, message, meta));
  }

  static warn(message, meta) {
    console.warn(this._formatMessage(LOG_LEVELS.warn, message, meta));
  }

  static error(message, meta) {
    console.error(this._formatMessage(LOG_LEVELS.error, message, meta));
  }

  static debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this._formatMessage(LOG_LEVELS.debug, message, meta));
    }
  }
}

module.exports = Logger;
