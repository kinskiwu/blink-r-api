import { createClient } from 'redis';
import 'dotenv/config';
import { logger } from '../../../utils/logger';

/**
 * Initializes and connects a Redis client using environment variables.
 */
export const connectRedis = async () => {
  if (
    !process.env.REDIS_PASSWORD ||
    !process.env.REDIS_HOST ||
    !process.env.REDIS_PORT
  ) {
    throw new Error(
      'Missing required environment variables for Redis connection'
    );
  }

  const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
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
