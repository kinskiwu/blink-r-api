import { Request, Response, NextFunction } from 'express';
import { UrlModel } from '../models/urls.model';
import {
  findOrCreateShortUrl,
  redirectShortUrlToLongUrl,
} from '../services/urlServices';
import { AccessLogModel } from '../models/accessLogs.model';
import { calculateStartDate } from '../../utils/helpers';

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
    const shortUrl = await findOrCreateShortUrl(longUrl);
    return res.status(201).json({ shortUrl });
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
    const shortUrlId = req.params.shortUrlId as string;
    const longUrl = await redirectShortUrlToLongUrl(shortUrlId);
    return res.redirect(301, longUrl);
  } catch (err) {
    next({
      status: 500,
      message: 'Server error encountered while redirecting short URL.',
      err,
    });
  }
};

/**
 * Generates analytics for a short url based on a specified time frame.
 * @param req - The request object containing the short url ID and the time frame.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
export const generateAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shortUrlId = req.query.shortUrlId as string;
    const timeFrame = req.query.timeFrame as string;

    const urlDocument = await UrlModel.findOne({
      'shortUrls.shortUrlId': shortUrlId,
    });

    if (!urlDocument) {
      return res.status(400).json({ message: 'Short URL not found.' });
    }

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
  } catch (err) {
    next({
      status: 500,
      message: 'Server error encountered while generating analytics.',
      err,
    });
  }
};
