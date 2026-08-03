/**
 * Camp Repository — Data access layer for blood donation camps (RedDrop AI V2)
 */
const BaseRepository = require('./base.repository');

class CampRepository extends BaseRepository {
  constructor() {
    super('donation_camps');
  }

  // TODO: implement camp-specific queries
  // async findUpcoming(city, limit) { ... }
  // async findByOrganizer(organizerId) { ... }
}

module.exports = new CampRepository();
