/**
 * Request DTO — Input contract for blood request endpoints (RedDrop AI V2)
 */

const createRequestDTO = {
  bloodGroup: { type: 'string', required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  unitsNeeded: { type: 'integer', required: true, minimum: 1 },
  emergencyLevel: { type: 'string', required: true, enum: ['critical', 'urgent', 'normal'] },
  hospitalId: { type: 'integer', required: true },
  notes: { type: 'string', maxLength: 500 }
};

module.exports = { createRequestDTO };
