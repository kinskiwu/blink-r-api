import { Request, Response, NextFunction } from 'express';
import { UrlModel } from '../models/urls.model';
import { generateShortUrl } from '../services/generateShortUrl';
import { v4 as uuid } from 'uuid';
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
    let urlDocument = await UrlModel.findOne({ longUrl });
    let shortUrlId;

    if (!urlDocument) {
      const longUrlId = uuid();
      shortUrlId = generateShortUrl(longUrlId);

      urlDocument = new UrlModel({
        longUrlId,
        longUrl,
        shortUrls: [{ shortUrlId }],
      });

      await urlDocument.save();
    } else {
      shortUrlId = generateShortUrl();
      urlDocument.shortUrls.push({ shortUrlId });
      await urlDocument.save();
    }

    res.status(201).json({ shortUrl: `www.shorturl.com/${shortUrlId}` });
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
 * @param req - The request object containing the short url ID.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
export const redirectToLongUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shortUrlId } = req.params;

    const urlDocument = await UrlModel.findOne({
      'shortUrls.shortUrlId': shortUrlId,
    });

    if (!urlDocument) {
      return res.status(404).json({ error: 'Short URL not found' });
    } else {
      const accessLogDocument = new AccessLogModel({ shortUrlId });
      await accessLogDocument.save();

      return res.redirect(301, urlDocument.longUrl);
    }
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
    const { shortUrlId, timeFrame = 'all' } = req.params;
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
