/**
 * Email Background Worker — processes queued email dispatch jobs (RedDrop AI V2)
 * Consumes jobs from queue.service.js and delegates to email.service.js
 */
// TODO: integrate with BullMQ or similar queue library
// const { emailQueue } = require('../services/queue.service');
// const emailService = require('../services/email.service');

// emailQueue.process(async (job) => {
//   const { to, subject, template, data } = job.data;
//   await emailService.send({ to, subject, template, data });
// });

module.exports = {};
