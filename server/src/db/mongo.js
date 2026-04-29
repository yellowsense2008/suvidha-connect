import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI not set in .env');
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'suvidha', // always use suvidha db — never touches ai_shopper
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected → suvidha database');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
};

export default mongoose;
