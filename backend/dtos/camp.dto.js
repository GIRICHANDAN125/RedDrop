/**
 * Camp DTO — Input contract for blood donation camp endpoints (RedDrop AI V2)
 */

const createCampDTO = {
  name: { type: 'string', required: true },
  city: { type: 'string', required: true },
  address: { type: 'string', required: true },
  date: { type: 'string', required: true, format: 'date' },
  startTime: { type: 'string', required: true },
  endTime: { type: 'string', required: true },
  organizer: { type: 'string', required: true }
};

module.exports = { createCampDTO };
