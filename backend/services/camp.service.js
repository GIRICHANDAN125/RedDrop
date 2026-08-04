const campRepository = require('../repositories/camp.repository');
const QueueService = require('./queue.service');
const Logger = require('../utils/logger');

class CampService {
  async listCamps(query = {}) {
    return await campRepository.findUpcoming({
      city: query.city,
      limit: query.limit || 20
    });
  }

  async getById(id) {
    const camp = await campRepository.findById(id);
    if (!camp) {
      throw { statusCode: 404, message: 'Donation camp not found.' };
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

    QueueService.enqueue('CAMP_CREATED_NOTIFICATION', { campId, city: data.city }, async (payload) => {
      Logger.info(`Broadcasted new camp alert for city ${payload.city}`);
    });

    return await this.getById(campId);
  }
}

module.exports = new CampService();
