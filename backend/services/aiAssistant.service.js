/**
 * RedDrop AI — Interactive Assistant & Eligibility Advisory Service
 */

const COMPATIBILITY_MATRIX = {
  'O-': { canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-'] },
  'O+': { canDonateTo: ['O+', 'A+', 'B+', 'AB+'], canReceiveFrom: ['O-', 'O+'] },
  'A-': { canDonateTo: ['A-', 'A+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'A-'] },
  'A+': { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+'] },
  'B-': { canDonateTo: ['B-', 'B+', 'AB-', 'AB+'], canReceiveFrom: ['O-', 'B-'] },
  'B+': { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['O-', 'O+', 'B-', 'B+'] },
  'AB-': { canDonateTo: ['AB-', 'AB+'], canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
};

class AiAssistantService {
  /**
   * Process user health / eligibility queries
   */
  processQuery(userQuery, userContext = {}) {
    const q = (userQuery || '').toLowerCase();

    // 1. Tattoo / Piercing query
    if (q.includes('tattoo') || q.includes('piercing')) {
      return {
        answer: 'In India and standard blood donation guidelines, you must wait 6 months after getting a tattoo or body piercing before donating blood to ensure zero risk of blood-borne infections.',
        category: 'eligibility',
        eligibleToDonate: false,
        deferralMonths: 6
      };
    }

    // 2. Donation Frequency / Interval query
    if (q.includes('frequency') || q.includes('how often') || q.includes('interval') || q.includes('days')) {
      return {
        answer: 'Male donors can donate whole blood every 90 days (3 months), while female donors can donate every 120 days (4 months). Platelet donation (apheresis) can be done every 14 days.',
        category: 'eligibility',
        intervalDaysMale: 90,
        intervalDaysFemale: 120
      };
    }

    // 3. Alcohol / Smoking query
    if (q.includes('alcohol') || q.includes('drink') || q.includes('smoke')) {
      return {
        answer: 'You should not consume alcohol for at least 24 hours prior to donating blood. Avoid smoking for at least 2 hours before and 2 hours after donating.',
        category: 'guidelines'
      };
    }

    // 4. Weight / Hemoglobin query
    if (q.includes('weight') || q.includes('hemoglobin') || q.includes('hb')) {
      return {
        answer: 'To donate blood, your body weight must be at least 45 kg (100 lbs) and your hemoglobin level must be at least 12.5 g/dL.',
        category: 'eligibility',
        minWeightKg: 45,
        minHb: 12.5
      };
    }

    // 5. Blood Compatibility query
    if (q.includes('compatible') || q.includes('group') || q.includes('who can give') || q.includes('who can receive')) {
      const bg = userContext.bloodGroup || 'O+';
      const info = COMPATIBILITY_MATRIX[bg] || COMPATIBILITY_MATRIX['O+'];
      return {
        answer: `As an ${bg} donor, you can donate blood to: ${info.canDonateTo.join(', ')}. You can receive blood from: ${info.canReceiveFrom.join(', ')}.`,
        category: 'compatibility',
        compatibility: info
      };
    }

    // Fallback advisory answer
    return {
      answer: 'RedDrop AI Assistant is available to help you check donor eligibility, compatibility, emergency procedures, and donation guidelines. Feel free to ask about weight limits, donation intervals, or blood group matching!',
      category: 'general'
    };
  }

  /**
   * Get compatibility data for blood group
   */
  getCompatibility(bloodGroup) {
    return COMPATIBILITY_MATRIX[bloodGroup] || null;
  }
}

module.exports = new AiAssistantService();
