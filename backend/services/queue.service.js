/**
 * Background Queue Service Engine for RedDrop AI V2
 */
const Logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.jobs = [];
    this.isProcessing = false;
  }

  /**
   * Enqueue asynchronous non-blocking job
   */
  async enqueue(jobName, payload, taskHandler) {
    const job = {
      id: `job_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: jobName,
      payload,
      taskHandler,
      createdAt: new Date()
    };

    this.jobs.push(job);
    Logger.info(`📥 Job enqueued: ${job.name}`, { jobId: job.id });

    // Trigger async non-blocking queue process
    setImmediate(() => this.processQueue());
  }

  /**
   * Process queued jobs sequentially
   */
  async processQueue() {
    if (this.isProcessing || this.jobs.length === 0) return;

    this.isProcessing = true;

    while (this.jobs.length > 0) {
      const job = this.jobs.shift();
      try {
        Logger.info(`⚙️ Processing job: ${job.name}`, { jobId: job.id });
        await job.taskHandler(job.payload);
        Logger.info(`✅ Job completed: ${job.name}`, { jobId: job.id });
      } catch (err) {
        Logger.error(`❌ Job failed: ${job.name}`, { jobId: job.id, error: err.message });
      }
    }

    this.isProcessing = false;
  }
}

module.exports = new QueueService();
