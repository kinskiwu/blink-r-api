import { createClient } from 'redis';
import 'dotenv/config';

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

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  await redisClient.connect();
  console.log('Connected to Redis');
  return redisClient;
};
