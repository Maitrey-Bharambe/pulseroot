import mongoose from 'mongoose';

const SensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  lightStatus: {
    type: String,
    required: true,
    enum: ['DARK', 'BRIGHT', 'DIM']
  },
  lightValue: {
    type: Number,
    required: true
  },
  ledStatus: {
    type: Boolean,
    required: true
  },
  environmentCondition: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Composite index for time-series range aggregations
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.models.SensorData || mongoose.model('SensorData', SensorDataSchema);
