import mongoose from 'mongoose';
import 'dotenv/config';

const mongoDBUrl = process.env.MONGODB_URL;
// validate existence of mongodb connection url
if (!mongoDBUrl) {
  throw new Error('MONGODB_URL environment variable is not set.');
}

/**
 * Establishes a connection to the mongodb database.
 */
export const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoDBUrl);
    console.log('Successfully connected to MongoDB.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};
