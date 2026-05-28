import mongoose from 'mongoose';

const SecurityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['auth_success', 'auth_fail', 'replay_attack', 'quota_exceeded', 'suspicious_activity', 'key_mismatch']
  },
  deviceId: {
    type: String,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.models.SecurityLog || mongoose.model('SecurityLog', SecurityLogSchema);
