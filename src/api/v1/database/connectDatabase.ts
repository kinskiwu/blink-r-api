import mongoose from 'mongoose';
import 'dotenv/config';

const mongoDBUrl = process.env.MONGODB_URL;
// throw error if env variable for mongodb url not set
if (!mongoDBUrl) {
  throw new Error('MONGODB_URL environment variable is not set.');
}

// function to connect to mongodb
export const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoDBUrl);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};
