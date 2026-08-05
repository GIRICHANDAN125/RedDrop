const hospitalRepository = require('../repositories/hospital.repository');
const bloodBankRepository = require('../repositories/bloodBank.repository');
const { pool } = require('../config/database');
const { emitToRole } = require('../config/socket');
const Logger = require('../utils/logger');

class HospitalService {
  async getDashboardData(userId) {
    const hospital = await hospitalRepository.findByUserId(userId);
    if (!hospital) {
      const err = new Error('Hospital profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const bloodBank = await bloodBankRepository.getByHospitalId(hospital.id);
    const inventory = bloodBank?.units_available
      ? (typeof bloodBank.units_available === 'string' ? JSON.parse(bloodBank.units_available) : bloodBank.units_available)
      : { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 };

    // Real SQL stats
    const [statsRows] = await pool.execute(
      `SELECT
         (SELECT COUNT(*) FROM blood_requests WHERE status IN ('searching', 'pending')) AS pending_requests,
         (SELECT COUNT(*) FROM request_responses rr
          JOIN donor_profiles dp ON rr.donor_id = dp.id
          WHERE rr.accepted_at >= CURDATE() AND rr.status IN ('accepted', 'donated')) AS active_donations_today,
         (SELECT COUNT(*) FROM donor_profiles WHERE is_verified = 1) AS total_donors_verified`
    );

    const stats = statsRows[0] || {};

    // Recent appointments for this hospital
    const [appointments] = await pool.execute(
      `SELECT ha.*, up.name as donor_name, up.blood_group, up.phone
       FROM hospital_appointments ha
       JOIN user_profiles up ON ha.donor_user_id = up.user_id
       WHERE ha.hospital_id = ? AND ha.appointment_date >= CURDATE()
       ORDER BY ha.appointment_date ASC, ha.appointment_time ASC
       LIMIT 10`,
      [hospital.id]
    ).catch(() => [[]]); // graceful if table doesn't exist yet

    return {
      hospital,
      bloodBank: bloodBank || null,
      inventory,
      totalStock: Object.values(inventory).reduce((acc, curr) => acc + (parseInt(curr) || 0), 0),
      stats: {
        pendingRequests: stats.pending_requests || 0,
        activeDonationsToday: stats.active_donations_today || 0,
        totalDonorsVerified: stats.total_donors_verified || 0
      },
      upcomingAppointments: appointments
    };
  }

  async updateInventory(userId, inventoryData) {
    const hospital = await hospitalRepository.findByUserId(userId);
    if (!hospital) {
      const err = new Error('Hospital profile not found.');
      err.statusCode = 404;
      throw err;
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
      Logger.info('Blood bank created for hospital', { hospitalId: hospital.id, newBankId });

      // Notify all hospital-role users of inventory update
      emitToRole('hospital', 'inventory:updated', { hospitalId: hospital.id, inventory: inventoryData });

      return { success: true, id: newBankId, inventory: inventoryData };
    }

    await bloodBankRepository.updateInventory(hospital.id, inventoryData);

    // Notify real-time
    emitToRole('hospital', 'inventory:updated', { hospitalId: hospital.id, inventory: inventoryData });

    return { success: true, inventory: inventoryData };
  }

  async listHospitals(query) {
    if (query.lat && query.lng) {
      return await hospitalRepository.findNearby({
        lat: parseFloat(query.lat),
        lng: parseFloat(query.lng),
        maxDistanceKm: parseFloat(query.radius) || 50,
        limit: parseInt(query.limit) || 20
      });
    }
    return await hospitalRepository.findAllVerified(query.limit || 20);
  }

  async listBloodBanks(query) {
    if (query.lat && query.lng) {
      return await bloodBankRepository.findNearby({
        lat: parseFloat(query.lat),
        lng: parseFloat(query.lng),
        maxDistanceKm: parseFloat(query.radius) || 50,
        limit: parseInt(query.limit) || 20
      });
    }
    // Return all blood banks with hospital info
    const [rows] = await pool.query(
      `SELECT bb.*, hp.hospital_name, hp.address, hp.city, hp.state
       FROM blood_banks bb
       LEFT JOIN hospital_profiles hp ON bb.hospital_profile_id = hp.id
       ORDER BY bb.created_at DESC
       LIMIT ?`,
      [parseInt(query.limit) || 20]
    );
    return rows;
  }
}

module.exports = new HospitalService();
