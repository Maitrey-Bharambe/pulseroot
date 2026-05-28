import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: 'Garden'
  },
  ownerId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: Boolean,
    default: true
  },
  deviceKey: {
    type: String, // AES encrypted security key
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);
