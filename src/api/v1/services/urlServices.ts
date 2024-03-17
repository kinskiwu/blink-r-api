import { v4 as uuid } from 'uuid';
import { calculateStartDate, encodeToBase62 } from '../../utils/helpers';
import { UrlModel } from '../models/urls.model';

import { NotFoundError } from '../../utils/errors';
import { AccessLogModel } from '../models/accessLogs.model';

/**
 * Generates a short URL identifier.
 *
 * @param {string} uniqueId - An optional parameter to provide a custom unique identifier. If not provided, a new uuid will be generated.
 * @returns {string} - The base62 encoded string of the uniqueId, acting as a short URL identifier.
 */
export const generateShortUrl = (uniqueId: string = uuid()): string => {
  return encodeToBase62(uniqueId);
};

/**
 * Retrieves an existing short URL or creates a new one for a given long URL.
 *
 * @param longUrl The original long URL to shorten.
 * @returns A promise that resolves to the full short URL path.
 */
export const findOrCreateShortUrl = async (longUrl: string) => {
  let urlDocument = await UrlModel.findOne({ longUrl: { $eq: longUrl } });
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

  return shortUrlId;
};

export const findShortUrl = async (shortUrlId) => {
  const urlDocument = await UrlModel.findOne({
    'shortUrls.shortUrlId': { $eq: shortUrlId },
  });

  if (!urlDocument) {
    throw new NotFoundError('Short URL not found');
  }

  return urlDocument;
};

export const getAccessCountForShortUrl = async (
  shortUrlId: string,
  timeFrame: string
): Promise<number> => {
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

  return accessCount.length > 0 ? accessCount[0].accessCount : 0;
};
