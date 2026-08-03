/**
 * BloodBank Repository — Data access layer for blood bank inventory (RedDrop AI V2)
 */
const BaseRepository = require('./base.repository');

class BloodBankRepository extends BaseRepository {
  constructor() {
    super('blood_bank_inventory');
  }

  // TODO: implement blood bank-specific queries
  // async getInventoryByHospital(hospitalId) { ... }
  // async updateStock(hospitalId, bloodGroup, units) { ... }
}

module.exports = new BloodBankRepository();
