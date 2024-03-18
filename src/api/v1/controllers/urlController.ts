import { Request, Response, NextFunction } from 'express';
import {
  findOrCreateShortUrl,
  findShortUrl,
  getAccessCountForShortUrl,
} from '../services/urlServices';
import { AccessLogModel } from '../models/accessLogs.model';
import { NotFoundError } from '../../utils/errors';
import { RedisClientType } from 'redis';

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

    if (!shortUrlId) {
      next({
        status: 500,
        message: 'Failed to create short URL.',
      });
      return;
    }

    res.status(201).json({ shortUrl: `www.shorturl.com/${shortUrlId}` });
  } catch (err) {
    return next({
      status: 500,
      message: 'Server error encountered while creating short URL.',
      err,
    });
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
      console.log('Cache hit');
      return res.redirect(301, cachedUrl);
    }

    console.log('Cache miss');
    const urlDocument = await findShortUrl(shortUrlId);

    await redisClient.set(`shortUrl:${shortUrlId}`, urlDocument.longUrl, {
      EX: process.env.REDIS_EXPIRATION_TIME_LONGURL || 604800, // 1 week,
    });

    res.redirect(301, urlDocument.longUrl);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(400).json({ error: error.message });
    }
    return next({
      status: 500,
      message: 'Server error encountered while redirecting short URL.',
      error,
    });
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
    const timeFrame = (req.query.timeFrame as string) || 'all';
    const redisClient: RedisClientType = req.app.locals.redisClient;

    const cacheKey = `analytics:${shortUrlId}:${timeFrame}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit');
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log('Cache miss');
    await findShortUrl(shortUrlId);
    const count = await getAccessCountForShortUrl(shortUrlId, timeFrame);

    let expirationTime;
    if (timeFrame === 'all' || !req.query.timeFrame) {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_ALL || 86400; // 24 hrs
    } else if (timeFrame === '7d') {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_7D || 21600; // 6 hrs
    } else if (timeFrame === '24h') {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_24H || 1800; // 30 mins
    } else {
      expirationTime = process.env.REDIS_EXPIRATION_TIME_ACCESSLOGS_DEFAULT || 3600; // 1 hr
    }

    await redisClient.set(
      cacheKey,
      JSON.stringify({ timeFrame, accessCount: count }),
      { EX: Number(expirationTime) }
    );

    res.status(200).json({ timeFrame, accessCount: count });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(400).json({ error: error.message });
    }

    return next({
      status: 500,
      message: 'Server error encountered while generating analytics.',
      err: error,
    });
  }
};
