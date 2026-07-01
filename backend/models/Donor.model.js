const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    nextAvailableDate: Date,
    schedule: [{
      day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
      startTime: String,
      endTime: String
    }]
  },
  medicalHistory: {
    lastDonationDate: Date,
    hemoglobinLevel: Number,
    weight: Number,
    age: Number,
    hasChronicDisease: { type: Boolean, default: false },
    diseases: [String],
    medications: [String],
    isFitToDonate: { type: Boolean, default: true }
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  stats: {
    totalDonations: { type: Number, default: 0 },
    livesSaved: { type: Number, default: 0 },
    requestsAccepted: { type: Number, default: 0 },
    requestsDeclined: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100 },
    avgResponseTime: { type: Number, default: 0 } // in minutes
  },
  verificationStatus: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    documents: [{
      type: String,
      url: String,
      publicId: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  preferredContactMethod: {
    type: String,
    enum: ['phone', 'app', 'both'],
    default: 'both'
  },
  maxDistanceKm: {
    type: Number,
    default: 20
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

donorSchema.index({ location: '2dsphere' });
donorSchema.index({ bloodGroup: 1, 'availability.isAvailable': 1 });

// Check if eligible to donate (90 day gap minimum)
donorSchema.methods.canDonate = function() {
  if (!this.medicalHistory.lastDonationDate) return true;
  const daysSince = (Date.now() - this.medicalHistory.lastDonationDate) / (1000 * 60 * 60 * 24);
  return daysSince >= 90;
};

module.exports = mongoose.model('Donor', donorSchema);
