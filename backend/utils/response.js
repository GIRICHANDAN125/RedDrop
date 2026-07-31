/**
 * Standardized API Response Helper for RedDrop AI V2
 */

class ResponseUtil {
  /**
   * Format a successful response envelope
   */
  static success(res, { code = 200, message = 'Success', data = {}, pagination = null, meta = {} }) {
    const payload = {
      success: true,
      code,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.req?.id || res.req?.headers['x-request-id'] || `req_${Date.now()}`,
        ...meta
      }
    };

    if (pagination) {
      payload.pagination = pagination;
    }

    return res.status(code).json(payload);
  }

  /**
   * Format a standard error envelope (RFC 7807 Problem Details style)
   */
  static error(res, { code = 400, type = 'BAD_REQUEST', message = 'An error occurred', details = [] }) {
    return res.status(code).json({
      success: false,
      code,
      error: {
        type,
        message,
        details
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.req?.id || res.req?.headers['x-request-id'] || `req_${Date.now()}`
      }
    });
  }
}

module.exports = ResponseUtil;
