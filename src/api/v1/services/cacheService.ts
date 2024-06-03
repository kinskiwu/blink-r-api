import { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { logger } from '../../../config/winston';

export class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
    this.client.connect();
  }

  public async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      if (value) {
        logger.info(`Cache hit for key: ${key}`);
      } else {
        logger.info(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      logger.error(`Error fetching from cache: ${error}`);
      throw error;
    }
  }

  public async set(
    key: string,
    value: string,
    expirationTime: number
  ): Promise<void> {
    try {
      await this.client.set(key, value, { EX: expirationTime });
    } catch (error) {
      logger.error(`Error setting cache: ${error}`);
      throw error;
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Error deleting cache: ${error}`);
      throw error;
    }
  }
}
