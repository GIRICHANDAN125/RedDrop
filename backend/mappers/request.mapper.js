/**
 * Request Response Mapper for RedDrop AI V2
 * Strips internal SQL column names and maps to clean API response shape.
 */
class RequestMapper {
  /**
   * @param {Object} request - Raw SQL row from blood_requests table
   * @returns {Object} Clean blood request DTO for API response
   */
  toResponse(request) {
    return {
      id: request.id,
      bloodGroup: request.blood_group,
      unitsNeeded: request.units_needed,
      emergencyLevel: request.emergency_level,
      status: request.status,
      hospital: request.hospital_name || null,
      hospitalId: request.hospital_id || null,
      notes: request.notes || null,
      createdAt: request.created_at,
      updatedAt: request.updated_at || null
    };
  }

  /**
   * Map an array of raw request rows
   * @param {Object[]} requests
   * @returns {Object[]}
   */
  toResponseList(requests) {
    return requests.map((r) => this.toResponse(r));
  }
}

module.exports = new RequestMapper();
