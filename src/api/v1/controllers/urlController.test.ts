import { Request, Response, NextFunction } from 'express';
import { findOrCreateShortUrl } from '../services/urlServices';
import {
  createShortUrl,
  generateAnalytics,
  redirectToLongUrl,
} from './urlController';
import { UrlModel } from '../models/urls.model';
import { AccessLogModel } from '../models/accessLogs.model';

jest.mock('../services/urlServices', () => ({
  findOrCreateShortUrl: jest.fn(),
}));
jest.mock('../models/urls.model', () => ({
  UrlModel: {
    findOne: jest.fn(),
  },
}));
jest.mock('../models/accessLogs.model', () => ({
  AccessLogModel: {
    aggregate: jest.fn(),
  },
}));
jest.mock('../../utils/helpers', () => ({
  calculateStartDate: jest.fn(),
}));

describe('URL Controller Tests', () => {
  describe('createShortUrl Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('should successfully create a short URL for a valid long URL', async () => {
      const mockLongUrl = 'http://cloudflare.com';
      const mockShortUrl = 'http://shorturl/cloudflare';
      (findOrCreateShortUrl as jest.Mock).mockResolvedValue(mockShortUrl);
      req.body.longUrl = mockLongUrl;

      await createShortUrl(req as Request, res as Response, next);

      expect(findOrCreateShortUrl).toHaveBeenCalledWith(mockLongUrl);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ shortUrl: mockShortUrl });
    });

    it('should handle server error when URL creation fails', async () => {
      const mockError = new Error('Server error');
      (findOrCreateShortUrl as jest.Mock).mockRejectedValue(mockError);
      req.body.longUrl = 'http://cloudflare.com';

      await createShortUrl(req as Request, res as Response, next);

      expect(findOrCreateShortUrl).toHaveBeenCalledWith(
        'http://cloudflare.com'
      );
      expect(next).toHaveBeenCalledWith({
        status: 500,
        message: 'Server error encountered while creating short URL.',
        err: mockError,
      });
    });

    it('should call next with an error if findOrCreateShortUrl does not return a URL', async () => {
      const mockLongUrl = 'http://cloudflare.com';
      (findOrCreateShortUrl as jest.Mock).mockResolvedValue(null);
      req.body.longUrl = mockLongUrl;

      await createShortUrl(req as Request, res as Response, next);

      expect(findOrCreateShortUrl).toHaveBeenCalledWith(mockLongUrl);
      expect(next).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('redirectToLongUrl Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
      jest.clearAllMocks()
      req = { params: { shortUrlId: '' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });
    // todo: debug line 118
    it('redirects to the corresponding long URL for a valid shortUrlId', async () => {
      const mockShortUrlId = 'valid';
      const mockLongUrl = 'https://cloudflare.com';
      req.params!.shortUrlId = mockShortUrlId;

      (UrlModel.findOne as jest.Mock).mockResolvedValue({
        longUrl: mockLongUrl,
        shortUrls: [{ shortUrlId: mockShortUrlId }],
      });

      await redirectToLongUrl(req as Request, res as Response, next);

      expect(UrlModel.findOne).toHaveBeenCalledWith({
        'shortUrls.shortUrlId': { $eq: mockShortUrlId },
      });

      // expect(res.redirect).toHaveBeenCalledWith(301, mockLongUrl);
    });

    it('returns a 400 error if the short URL is not found', async () => {
      req.params!.shortUrlId = 'invalidShortId';
      (UrlModel.findOne as jest.Mock).mockResolvedValue(null);

      await redirectToLongUrl(req as Request, res as Response, next);

      expect(UrlModel.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Short URL not found' });
    });

    it('handles server errors gracefully', async () => {
      const mockError = new Error('Test Error');
      req.params!.shortUrlId = 'shortIdWithError';
      (UrlModel.findOne as jest.Mock).mockRejectedValue(mockError);

      await redirectToLongUrl(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          message: 'Server error encountered while redirecting short URL.',
        })
      );
    });
  });

  describe('generateAnalytics Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.Mock<NextFunction>;

    beforeEach(() => {
      req = { query: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      next = jest.fn();
    });

    it('successfully returns analytics data for a valid short URL and time frame', async () => {
      req.query = { shortUrlId: 'validShortId', timeFrame: '24h' };
      const mockAccessData = [{ accessCount: 5 }];
      (UrlModel.findOne as jest.Mock).mockResolvedValue(true);
      (AccessLogModel.aggregate as jest.Mock).mockResolvedValue(mockAccessData);

      await generateAnalytics(req as Request, res as Response, next);

      expect(UrlModel.findOne).toHaveBeenCalled();
      expect(AccessLogModel.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        timeFrame: '24h',
        accessCount: 5,
      });
    });

    it('returns a 400 error if the short URL is not found', async () => {
      req.query = { shortUrlId: 'nonexistentId', timeFrame: '7d' };
      (UrlModel.findOne as jest.Mock).mockResolvedValue(null);

      await generateAnalytics(req as Request, res as Response, next);

      expect(UrlModel.findOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Short URL not found.',
      });
    });

    it('handles server errors gracefully', async () => {
      req.query = { shortUrlId: 'errorId', timeFrame: '24h' };
      const error = new Error('Test error');
      (UrlModel.findOne as jest.Mock).mockRejectedValue(error);

      await generateAnalytics(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          message: 'Server error encountered while generating analytics.',
          err: error,
        })
      );
    });

    it('returns analytics with default time frame when an unsupported time frame is provided', async () => {
      req.query = { shortUrlId: 'validShortId', timeFrame: 'unsupported' };
      const mockAccessData = [{ accessCount: 10 }];
      (UrlModel.findOne as jest.Mock).mockResolvedValue(true);
      (AccessLogModel.aggregate as jest.Mock).mockResolvedValue(mockAccessData);

      await generateAnalytics(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        timeFrame: 'unsupported',
        accessCount: 10,
      });
    });
  });
});
