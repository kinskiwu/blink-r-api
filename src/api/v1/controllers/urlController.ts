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
 * @param req - The request object containing the long url.
 * @param res - The response object.
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
 * @param req - The request object, containing the shortUrlId parameter.
 * @param res - The response object used to redirect to the long URL or send back an error.
 * @param next - The next middleware function in the stack for error handling.
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
      EX: 3600,
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
 * This function first attempts to retrieve the analytics data from Redis cache to improve performance.
 * If the data is not available in the cache (cache miss), it proceeds to calculate the analytics data.
 * Once the data is calculated, it is stored in the cache for future requests before sending the response to the client.
 *
 * @param req - The request object, containing query parameters 'shortUrlId' and 'timeFrame'.
 * @param res - The response object, used for sending analytics data back to the client.
 * @param next - The next middleware function, invoked for error handling.
 */
export const generateAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shortUrlId = req.query.shortUrlId as string;
    const timeFrame = req.query.timeFrame as string;
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

    await redisClient.set(
      cacheKey,
      JSON.stringify({ timeFrame, accessCount: count }),
      { EX: 3600 }
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
