import { Request, Response, NextFunction } from 'express';
import { findOrCreateShortUrl, findShortUrl } from '../services/urlServices';
import { AccessLogModel } from '../models/accessLogs.model';
import { calculateStartDate } from '../../utils/helpers';
import { NotFoundError } from '../../utils/errors';

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
) => {
  try {
    const { longUrl } = req.body;
    const shortUrlId = await findOrCreateShortUrl(longUrl);

    if (!shortUrlId) {
      return next({
        status: 500,
        message: 'Failed to create short URL.',
      });
    }

    return res.status(201).json({ shortUrl: `www.shorturl.com/${shortUrlId}` });
  } catch (err) {
    next({
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
  try {
    const { shortUrlId } = req.params;
    const urlDocument = await findShortUrl(shortUrlId);
    const accessLogDocument = new AccessLogModel({ shortUrlId });
    await accessLogDocument.save();

    return res.redirect(301, urlDocument.longUrl);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(400).json({ error: error.message });
    }

    next({
      status: 500,
      message: 'Server error encountered while redirecting short URL.',
      err: error,
    });
  }
};

/**
 * Generates analytics for a short url based on a specified time frame.
 */
export const generateAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shortUrlId = req.query.shortUrlId as string;
    const timeFrame = req.query.timeFrame as string;

    await findShortUrl(shortUrlId);

    const startDate = calculateStartDate(timeFrame);

    const accessCount = await AccessLogModel.aggregate([
      {
        $match: {
          shortUrlId,
          accessTime: { $gte: startDate },
        },
      },
      {
        $count: 'accessCount',
      },
    ]);

    const count = accessCount.length > 0 ? accessCount[0].accessCount : 0;
    res.status(200).json({ timeFrame, accessCount: count });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(400).json({ error: error.message });
    }

    next({
      status: 500,
      message: 'Server error encountered while generating analytics.',
      err: error,
    });
  }
};
