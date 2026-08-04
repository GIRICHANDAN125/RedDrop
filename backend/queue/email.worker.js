const QueueService = require('../services/queue.service');
const emailService = require('../services/email.service');
const Logger = require('../utils/logger');

/**
 * Email Background Worker
 * Processes email dispatch jobs asynchronously.
 */
class EmailWorker {
  static dispatchEmail(to, subject, template, data) {
    QueueService.enqueue('EMAIL_DISPATCH', { to, subject, template, data }, async (payload) => {
      Logger.info(`Sending email to ${payload.to}`, { subject: payload.subject });
      await emailService.sendEmail(payload);
    });
  }
}

module.exports = EmailWorker;
