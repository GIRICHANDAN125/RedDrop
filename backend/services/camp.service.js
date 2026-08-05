const campRepository = require('../repositories/camp.repository');
const campRegistrationRepository = require('../repositories/campRegistration.repository');
const QueueService = require('./queue.service');
const Logger = require('../utils/logger');
const { emitToLocation } = require('../config/socket');

class CampService {
  async listCamps(query = {}) {
    return await campRepository.findUpcoming({
      city: query.city,
      state: query.state,
      limit: parseInt(query.limit) || 20
    });
  }

  async getById(id) {
    const camp = await campRepository.findById(id);
    if (!camp) {
      const err = new Error('Donation camp not found.');
      err.statusCode = 404;
      throw err;
    }
    return camp;
  }

  async createCamp(userId, data) {
    const campId = await campRepository.create({
      organizer_user_id: userId,
      title: data.name || data.title,
      description: data.description || '',
      location_name: data.locationName || data.address || '',
      address: data.address || '',
      city: data.city,
      state: data.state || '',
      start_time: data.date ? `${data.date} ${data.startTime || '09:00:00'}` : new Date(),
      end_time: data.date ? `${data.date} ${data.endTime || '17:00:00'}` : new Date(),
      target_units: data.targetUnits || 50,
      status: 'upcoming'
    });

    Logger.info(`Camp created: ${campId}`, { userId });

    const camp = await this.getById(campId);

    // Broadcast to location room via Socket.IO
    emitToLocation(camp.city, camp.state || '', 'camp:new', {
      campId,
      title: camp.title,
      city: camp.city,
      startTime: camp.start_time
    });

    QueueService.enqueue('CAMP_CREATED_NOTIFICATION', { campId, city: data.city }, async (payload) => {
      Logger.info(`Broadcasted new camp alert for city ${payload.city}`);
    });

    return camp;
  }

  /**
   * Register a user for a camp. Generates a unique QR token.
   */
  async registerForCamp(campId, userId) {
    const camp = await this.getById(campId);

    if (camp.status === 'completed' || camp.status === 'cancelled') {
      const err = new Error('This camp is no longer accepting registrations.');
      err.statusCode = 400;
      throw err;
    }

    const registration = await campRegistrationRepository.registerUserForCamp(campId, userId);
    return { registration, camp };
  }

  /**
   * QR Check-in for a camp registration.
   */
  async checkIn(qrToken) {
    const registration = await campRegistrationRepository.findByQrToken(qrToken);
    if (!registration) {
      const err = new Error('Invalid QR code. Registration not found.');
      err.statusCode = 404;
      throw err;
    }
    if (registration.status !== 'registered') {
      return { alreadyCheckedIn: true, registration };
    }
    await campRegistrationRepository.checkIn(qrToken);

    // Emit real-time update
    emitToLocation(registration.city, '', 'camp:checkin', { campId: registration.camp_id, userId: registration.user_id });

    return { alreadyCheckedIn: false, registration };
  }

  /**
   * Get registrations for a camp.
   */
  async getCampRegistrations(campId) {
    await this.getById(campId);
    return await campRegistrationRepository.getRegistrationsForCamp(campId);
  }

  /**
   * Get all camp registrations for a user.
   */
  async getMyRegistrations(userId) {
    return await campRegistrationRepository.getRegistrationsForUser(userId);
  }
}

module.exports = new CampService();
