import { createClient } from 'redis';
import 'dotenv/config';
import { logger } from './winston';

/**
 * Initializes and connects a Redis client using environment variables.
 */
export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error(
      'Missing required environment variables for Redis connection'
    );
  }

  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => logger.info('Redis Client Error', err));

  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Error connecting to Redis', error);
  }

  return redisClient;
};
