/**
 * Donor DTO — Input contract for donor management endpoints (RedDrop AI V2)
 */

const updateDonorDTO = {
  bloodGroup: { type: 'string', required: true, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  city: { type: 'string', required: true },
  isAvailable: { type: 'boolean' },
  lastDonatedAt: { type: 'string', format: 'date' }
};

module.exports = { updateDonorDTO };
