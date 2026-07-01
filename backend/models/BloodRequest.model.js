const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  unitsRequired: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  unitsFulfilled: {
    type: Number,
    default: 0
  },
  emergencyLevel: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true
  },
  hospital: {
    name: { type: String, required: true },
    address: String,
    city: { type: String, required: true },
    state: String,
    pincode: String,
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    contactNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'searching', 'donor_found', 'in_transit', 'at_hospital', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  assignedDonors: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    units: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'donated', 'no_response'],
      default: 'pending'
    },
    acceptedAt: Date,
    donatedAt: Date,
    distance: Number,
    eta: Number // in minutes
  }],
  medicalReport: {
    url: String,
    publicId: String,
    uploadedAt: Date,
    aiVerification: {
      isVerified: Boolean,
      confidence: Number,
      flags: [String],
      verifiedAt: Date
    }
  },
  aiAnalysis: {
    fakeDetectionScore: { type: Number, default: 0 }, // 0-100, higher = more suspicious
    urgencyScore: { type: Number, default: 50 },
    flags: [String],
    recommendedDonors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donor' }],
    analyzedAt: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
  },
  notes: String,
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

bloodRequestSchema.index({ 'hospital.location': '2dsphere' });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });
bloodRequestSchema.index({ emergencyLevel: 1, createdAt: -1 });
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-generate request ID
bloodRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    this.requestId = 'RD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
