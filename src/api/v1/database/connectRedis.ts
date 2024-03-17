import { createClient } from 'redis';
import 'dotenv/config';

//todo: add redis url in .env
export const connectRedis = async () => {
  const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();

  console.log('Connected to Redis');
  return client;
};
