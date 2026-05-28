import mongoose from 'mongoose';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-plant-irrigation';
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const sanitizedUri = uri.replace(/\/\/.*@/, '//****:****@');
    console.log(`[Database] Initiating connection to: ${sanitizedUri}`);

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('MongoDB successfully connected!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
