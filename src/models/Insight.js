import mongoose from 'mongoose';

const InsightSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  insightType: {
    type: String,
    required: true,
    enum: ['watering_automation', 'heat_stress', 'light_exposure', 'humidity_alert', 'general_health']
  },
  result: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.models.Insight || mongoose.model('Insight', InsightSchema);
