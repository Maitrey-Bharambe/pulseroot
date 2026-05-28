import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4(),
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
