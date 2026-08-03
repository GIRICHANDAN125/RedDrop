/**
 * Donor Response Mapper for RedDrop AI V2
 * Strips internal SQL column names and maps to clean API response shape.
 */
class DonorMapper {
  /**
   * @param {Object} donor - Raw SQL row from donors/profiles tables
   * @returns {Object} Clean donor DTO for API response
   */
  toResponse(donor) {
    return {
      id: donor.id,
      name: donor.name,
      bloodGroup: donor.blood_group,
      city: donor.city,
      latitude: donor.latitude || null,
      longitude: donor.longitude || null,
      isAvailable: Boolean(donor.is_available),
      lastDonatedAt: donor.last_donated_at || null,
      totalDonations: donor.total_donations || 0
    };
  }

  /**
   * Map an array of raw donor rows
   * @param {Object[]} donors
   * @returns {Object[]}
   */
  toResponseList(donors) {
    return donors.map((d) => this.toResponse(d));
  }
}

module.exports = new DonorMapper();
