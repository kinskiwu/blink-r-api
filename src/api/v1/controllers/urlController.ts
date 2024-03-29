import { Request, Response, NextFunction } from 'express';
import {
  findOrCreateShortUrl,
  findShortUrl,
  getAccessCountForShortUrl,
} from '../services/urlServices';
import { AccessLogModel } from '../models/accessLogs.model';
import { RedisClientType } from 'redis';
import { logger } from '../../utils/logger';

/**
 * Creates a short url for a given long url and stores it in the database.
 * @param req - The request object containing body 'longUrl'.
 * @param res - The response object used to send back a short URL or send back an error.
 * @param next - The next middleware function in the stack.
 */
export const createShortUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { longUrl } = req.body;
    const shortUrlId = await findOrCreateShortUrl(longUrl);

    const baseUrl = process.env.BASE_URL || 'www.shorturl.com';

    res.status(201).json({ shortUrl: `${baseUrl}/${shortUrlId}` });
  } catch (err) {
    return next(err);
  }
};

/**
 * Redirects a short URL to its corresponding long URL.
 * Utilizes caching to improve performance by storing frequently accessed URLs.
 * @param req - The request object containing path param 'shortUrlId'.
 * @param res - The response object used to redirect to the long URL or send back an error.
 * @param next - The next middleware function in the stack.
 */
export const redirectToLongUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { shortUrlId } = req.params;
  const { redisClient } = req.app.locals;

  try {
    const accessLogDocument = new AccessLogModel({ shortUrlId });
    await accessLogDocument.save();

    const cachedUrl = await redisClient.get(`shortUrl:${shortUrlId}`);

    if (cachedUrl) {
      logger.info('Cache hit');
      return res.redirect(301, cachedUrl);
    }

    logger.info('Cache miss');
    const urlDocument = await findShortUrl(shortUrlId);

    await redisClient.set(`shortUrl:${shortUrlId}`, urlDocument.longUrl, {
      EX: process.env.REDIS_EXPIRATION_TIME_LONGURL || 604800, // 1 week,
    });

    res.redirect(301, urlDocument.longUrl);
  } catch (err) {
    return next(err);
  }
};

/**
 * Generates and returns analytics data for a given short URL based on the requested time frame.
 * Utilizes caching to improve performance by storing frequently accessed access counts.
 * @param req - The request object containing query parameters 'shortUrlId' and 'timeFrame'.
 * @param res - The response object used to send back analytics data or send back an error.
 * @param next - The next middleware function in the stack.
 */
export const generateAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shortUrlId = req.query.shortUrlId as string;
    let timeFrame = req.query.timeFrame;
    if (!timeFrame || (timeFrame !== '24h' && timeFrame !== '7d')) {
      timeFrame = 'all';
    }
    const redisClient: RedisClientType = req.app.locals.redisClient;

    const cacheKey = `analytics:${shortUrlId}:${timeFrame}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      logger.info('Cache hit');
      return res.status(200).json(JSON.parse(cachedData));
    }

    logger.info('Cache miss');
    await findShortUrl(shortUrlId);
    const count = await getAccessCountForShortUrl(shortUrlId, timeFrame);

    let expirationTime;
    if (timeFrame === 'all' || !req.query.timeFrame) {
      expirationTime =
        process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_ALL || 86400; // 24 hrs
    } else if (timeFrame === '7d') {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_7D || 21600; // 6 hrs
    } else if (timeFrame === '24h') {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_24H || 1800; // 30 mins
    } else {
      expirationTime =
        process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_DEFAULT || 3600; // 1 hr
    }

    await redisClient.set(
      cacheKey,
      JSON.stringify({ timeFrame, accessCount: count }),
      { EX: Number(expirationTime) }
    );

    res.status(200).json({ timeFrame, accessCount: count });
  } catch (err) {
    return next(err);
  }
};
