import { Request, Response, NextFunction } from 'express';
import UrlService from '../services/urlService';
import { CacheService } from '../services/cacheService';
import { logger } from '../../../config/winston';

const BASE_URL = process.env.BASE_URL || 'www.shorturl.com';
const DEFAULT_CACHE_EXPIRATION = parseInt(
  process.env.REDIS_EXPIRATION_TIME_LONGURL || '604800',
  10
); // 1 week
const HTTP_STATUS_MOVED_PERMANENTLY = 301;

export default class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Handles the creation of a short URL.
   */
  public createShortUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { longUrl } = req.body;
      if (!longUrl) {
        res.status(400).json({ error: 'longUrl is required' });
        return;
      }
      const shortUrlId = await this.urlService.findOrCreateShortUrl(longUrl);
      res.status(201).json({ shortUrl: `${BASE_URL}/${shortUrlId}` });
    } catch (error) {
      logger.error('Error creating short URL:', error);
      next(error);
    }
  };

  /**
   * Redirects to the long URL from a short URL, with caching.
   */
  public redirectToLongUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { shortUrlId } = req.params;

    if (!shortUrlId) {
      res.status(400).json({ error: 'shortUrlId is required' });
      return;
    }

    try {
      await this.urlService.logAccess(shortUrlId);

      const cachedLongUrl = await this.cacheService.get(
        `shortUrl:${shortUrlId}`
      );
      if (cachedLongUrl) {
        logger.info(`Cache hit for shortUrlId: ${shortUrlId}`);
        return res.redirect(HTTP_STATUS_MOVED_PERMANENTLY, cachedLongUrl);
      }

      logger.info(`Cache miss for shortUrlId: ${shortUrlId}`);
      const urlDocument = await this.urlService.findShortUrl(shortUrlId);
      const longUrl = urlDocument.longUrl;

      if (!longUrl) {
        throw new Error('Long URL not found in the document');
      }

      await this.cacheService.set(
        `shortUrl:${shortUrlId}`,
        longUrl,
        DEFAULT_CACHE_EXPIRATION
      );

      res.redirect(HTTP_STATUS_MOVED_PERMANENTLY, longUrl);
    } catch (error) {
      logger.error(`Error redirecting short URL ${shortUrlId}:`, error);
      next(error);
    }
  };

  /**
   * Generates and provides analytics data for a short URL.
   */
  public generateAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { shortUrlId, timeFrame } = req.query as {
      shortUrlId: string;
      timeFrame?: string;
    };

    if (!shortUrlId) {
      res.status(400).json({ error: 'shortUrlId is required' });
      return;
    }

    try {
      const cacheKey = `analytics:${shortUrlId}:${timeFrame || 'all'}`;
      const cachedData = await this.cacheService.get(cacheKey);

      if (cachedData) {
        logger.info(`Cache hit for analytics key: ${cacheKey}`);
        res.status(200).json(JSON.parse(cachedData));
        return;
      }

      logger.info(`Cache miss for analytics key: ${cacheKey}`);
      const accessCount = await this.urlService.getAccessCountForShortUrl(
        shortUrlId,
        timeFrame || 'all'
      );
      const expirationTime = this.calculateCacheExpirationTime(timeFrame);
      await this.cacheService.set(
        cacheKey,
        JSON.stringify({ timeFrame, accessCount }),
        expirationTime
      );

      res.status(200).json({ timeFrame, accessCount });
    } catch (error) {
      logger.error(
        `Error generating analytics for short URL ${shortUrlId}:`,
        error
      );
      next(error);
    }
  };

  /**
   * Calculates the appropriate cache expiration time based on the provided time frame.
   */
  private calculateCacheExpirationTime(timeFrame?: string): number {
    switch (timeFrame) {
      case '24h':
        return 1800; // 30 minutes
      case '7d':
        return 21600; // 6 hours
      default:
        return 86400; // 24 hours
    }
  }
}
