import mongoose from 'mongoose';

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
  }
  try {
    cached.conn = await cached.promise;
    console.log(`MongoDB connected: ${cached.conn.connection.host}`);
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
  return cached.conn;
};

