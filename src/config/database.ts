import mongoose from 'mongoose';
import 'dotenv/config';
import { logger } from './winston';

const mongoDBUrl = process.env.DATABASE_URL;
if (!mongoDBUrl) {
  throw new Error('Database environment variable is not set.');
}

export const connectDatabase = async () => {
  try {
    await mongoose.connect(mongoDBUrl);
    logger.info('Successfully connected to MongoDB.');
  } catch (err) {
    logger.error('Error connecting to MongoDB:', err);
  }
};
