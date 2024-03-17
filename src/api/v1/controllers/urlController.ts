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
 * Redirects a short url to its corresponding long url.
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
 * @param req - Express Request object. It includes the query parameters 'shortUrlId' and 'timeFrame'
 *              which denote the short URL ID and the analytics time frame respectively.
 * @param res - Express Response object. Used to send the response back to the client.
 * @param next - Next function to pass control to the next middleware in case of errors.
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
