import { Request, Response, NextFunction } from 'express';
import UrlService from '../services/urlService';
import { RedisClientType } from 'redis';
import { logger } from '../../../config/winston';

export default class UrlController {
  constructor(private readonly urlService: UrlService) {}

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
      const baseUrl = process.env.BASE_URL || 'www.shorturl.com';
      res.status(201).json({ shortUrl: `${baseUrl}/${shortUrlId}` });
    } catch (error) {
      next(error);
    }
  };

  public redirectToLongUrl = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { shortUrlId } = req.params;

    if (!shortUrlId) throw new Error('shortUrlId is required');

    const { redisClient } = req.app.locals as { redisClient: RedisClientType };

    try {
      await this.urlService.logAccess(shortUrlId);

      const cachedLongUrl = await redisClient.get(`shortUrl:${shortUrlId}`);
      if (cachedLongUrl) {
        logger.info('Cache hit');
        res.redirect(301, cachedLongUrl);
        return;
      }

      logger.info('Cache miss');
      const urlDocument = await this.urlService.findShortUrl(shortUrlId);

      const longUrl = urlDocument.longUrl;

      if (!longUrl) {
        throw new Error('Long URL not found in the document');
      }

      await redisClient.set(`shortUrl:${shortUrlId}`, urlDocument.longUrl, {
        EX: parseInt(process.env.REDIS_EXPIRATION_TIME_LONGURL || '604800', 10), // 1 week
      });

      res.redirect(301, urlDocument.longUrl);
    } catch (error) {
      next(error);
    }
  };

  public generateAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { shortUrlId, timeFrame } = req.query as {
      shortUrlId: string;
      timeFrame?: string;
    };

    try {
      const redisClient: RedisClientType = req.app.locals.redisClient;
      const cacheKey = `analytics:${shortUrlId}:${timeFrame || 'all'}`;
      const cachedData = await redisClient.get(cacheKey);

      if (cachedData) {
        logger.info('Cache hit');
        res.status(200).json(JSON.parse(cachedData));
        return;
      }

      logger.info('Cache miss');
      const accessCount = await this.urlService.getAccessCountForShortUrl(
        shortUrlId,
        timeFrame || 'all'
      );
      const expirationTime = this.calculateCacheExpirationTime(timeFrame);
      await redisClient.set(
        cacheKey,
        JSON.stringify({ timeFrame, accessCount }),
        { EX: expirationTime }
      );

      res.status(200).json({ timeFrame, accessCount });
    } catch (error) {
      next(error);
    }
  };

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
