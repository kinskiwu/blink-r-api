import { v4 as uuid } from 'uuid';
import { calculateStartDate, encodeToBase62 } from '../../../utils';

import {
  CustomError,
  DatabaseError,
  NotFoundError,
} from '../../../config/errors';
import { logger } from '../../../config/winston';
import DatabaseService from './databaseService';
import type { AccessLog, Url } from '../types/DBModelTypes';

interface AccessCountResult {
  count: number;
}

export default class UrlService {
  constructor(
    private readonly urlDatabaseService: DatabaseService<Url>,
    private readonly accessLogDatabaseService: DatabaseService<AccessLog>
  ) {}

  /**
   * Generates a short URL identifier using a UUID and encodes it to Base62.
   * @param uniqueId - An optional UUID. Defaults to a new UUID.
   * @returns The Base62 encoded unique identifier.
   */
  private encodeShortUrl(uniqueId: string = uuid()): string {
    return encodeToBase62(uniqueId);
  }

  /**
   * Retrieves an existing short URL or creates a new one for a given long URL.
   * @param originalLongUrl - The original long URL to shorten.
   * @returns A promise that resolves to the short URL identifier.
   */
  public async findOrCreateShortUrl(originalLongUrl: string): Promise<string> {
    try {
      const existingUrlDocument = await this.urlDatabaseService.findOne({
        longUrl: originalLongUrl,
      });

      if (!existingUrlDocument) {
        return this.createAndSaveNewUrl(originalLongUrl);
      } else {
        const newShortUrlId = this.encodeShortUrl();
        await this.addShortUrlToExistingUrl(existingUrlDocument, newShortUrlId);
        return newShortUrlId;
      }
    } catch (error) {
      this.handleServiceError(error as Error);
    }
  }

  /**
   * Searches for a URL document based on a provided short URL ID.
   * @param shortUrlId - The unique identifier for the short URL.
   * @returns A promise that resolves to the found URL document.
   */
  public async findShortUrl(shortUrlId: string): Promise<Url> {
    try {
      const foundUrlDocument = await this.urlDatabaseService.findOne({
        'shortUrls._id': { $eq: shortUrlId },
      });

      if (!foundUrlDocument) {
        throw new NotFoundError('Short URL not found');
      }

      return foundUrlDocument;
    } catch (error) {
      this.handleServiceError(error as Error);
    }
  }

  /**
   * Retrieves the access count for a given short URL within a specified timeframe.
   * @param shortUrlId - The unique identifier of the short URL.
   * @param timeFrame - The timeframe for which access count is being requested.
   * @returns A promise that resolves to the number of times the short URL was accessed.
   */
  public async getAccessCountForShortUrl(
    shortUrlId: string,
    timeFrame: string
  ): Promise<number> {
    try {
      const startDate = calculateStartDate(timeFrame);

      const accessCountResult: AccessCountResult[] =
        await this.accessLogDatabaseService.aggregate([
          {
            $match: {
              shortUrlId,
              accessTime: { $gte: startDate },
            },
          },
          {
            $count: 'count',
          },
        ]);

      if (
        !accessCountResult ||
        accessCountResult.length === 0 ||
        !accessCountResult[0]
      ) {
        return 0;
      }

      return accessCountResult[0].count;
    } catch (error) {
      this.handleServiceError(error as Error);
    }
  }

  /**
   * Logs access to a short URL.
   * @param shortUrlId - The unique identifier of the short URL.
   */
  public async logAccess(shortUrlId: string): Promise<void> {
    try {
      const accessLogDocument = this.accessLogDatabaseService.create({
        shortUrlId,
        accessTime: new Date(),
      } as AccessLog);
      await this.accessLogDatabaseService.save(accessLogDocument);
      logger.info(`Access logged for shortUrlId: ${shortUrlId}`);
    } catch (error) {
      this.handleServiceError(error as Error);
    }
  }

  /**
   * Finds a URL document by the long URL.
   * @param longUrl - The long URL to search for.
   * @returns A promise that resolves to the URL document, if found.
   */
  private async findUrlByLongUrl(longUrl: string): Promise<Url | null> {
    return this.urlDatabaseService.findOne({ longUrl: { $eq: longUrl } });
  }

  /**
   * Creates and saves a new URL document with a long URL and generated short URL.
   * @param originalLongUrl - The original long URL to shorten.
   * @returns A promise that resolves to the short URL identifier.
   */
  private async createAndSaveNewUrl(originalLongUrl: string): Promise<string> {
    const newShortUrlId = this.encodeShortUrl();
    const newUrlDocument = this.urlDatabaseService.create({
      longUrl: originalLongUrl,
      shortUrls: [{ _id: newShortUrlId }],
    } as Url);

    await this.urlDatabaseService.save(newUrlDocument);
    return newShortUrlId;
  }

  /**
   * Adds a new short URL to an existing URL document.
   * @param existingUrlDocument - The existing URL document.
   * @param newShortUrlId - The short URL identifier to add.
   */
  private async addShortUrlToExistingUrl(
    existingUrlDocument: Url,
    newShortUrlId: string
  ): Promise<void> {
    existingUrlDocument.shortUrls.push({ _id: newShortUrlId });
    await this.urlDatabaseService.save(existingUrlDocument);
  }

  /**
   * Handles errors by throwing appropriate custom errors.
   * @param serviceError - The error to handle.
   * @throws CustomError - A custom error based on the provided error.
   */
  private handleServiceError(serviceError: Error): never {
    logger.error(serviceError);
    if (serviceError instanceof CustomError) {
      throw serviceError;
    } else {
      throw new DatabaseError('An error occurred while accessing the database');
    }
  }
}
