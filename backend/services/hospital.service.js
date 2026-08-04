const hospitalRepository = require('../repositories/hospital.repository');
const bloodBankRepository = require('../repositories/bloodBank.repository');

class HospitalService {
  async getDashboardData(userId) {
    const hospital = await hospitalRepository.findByUserId(userId);
    if (!hospital) {
      throw { statusCode: 404, message: 'Hospital profile not found.' };
    }

    const bloodBank = await bloodBankRepository.getByHospitalId(hospital.id);
    const inventory = bloodBank?.units_available 
      ? (typeof bloodBank.units_available === 'string' ? JSON.parse(bloodBank.units_available) : bloodBank.units_available)
      : { 'A+': 12, 'A-': 4, 'B+': 18, 'B-': 2, 'AB+': 8, 'AB-': 1, 'O+': 25, 'O-': 5 };

    return {
      hospital,
      inventory,
      totalStock: Object.values(inventory).reduce((acc, curr) => acc + (parseInt(curr) || 0), 0),
      stats: {
        pendingRequests: 3,
        activeDonationsToday: 7,
        totalDonorsVerified: 142
      }
    };
  }

  async updateInventory(userId, inventoryData) {
    const hospital = await hospitalRepository.findByUserId(userId);
    if (!hospital) {
      throw { statusCode: 404, message: 'Hospital profile not found.' };
    }

    let bloodBank = await bloodBankRepository.getByHospitalId(hospital.id);
    if (!bloodBank) {
      const newBankId = await bloodBankRepository.create({
        hospital_profile_id: hospital.id,
        name: hospital.hospital_name || 'Hospital Blood Bank',
        city: hospital.city || 'Unknown',
        address: hospital.address || '',
        contact_number: hospital.contact_number || '',
        units_available: JSON.stringify(inventoryData)
      });
      return { success: true, id: newBankId, inventory: inventoryData };
    }

    await bloodBankRepository.updateInventory(hospital.id, inventoryData);
    return { success: true, inventory: inventoryData };
  }

  async listHospitals(query) {
    if (query.lat && query.lng) {
      return await hospitalRepository.findNearby({
        lat: query.lat,
        lng: query.lng,
        maxDistanceKm: query.radius || 50,
        limit: query.limit || 20
      });
    }
    return await hospitalRepository.findAllBy('is_verified', true);
  }
}

module.exports = new HospitalService();
