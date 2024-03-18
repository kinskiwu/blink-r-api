import { Request, Response, NextFunction } from 'express';
import {
  findOrCreateShortUrl,
  findShortUrl,
  getAccessCountForShortUrl,
} from '../services/urlServices';
import {
  createShortUrl,
  generateAnalytics,
  redirectToLongUrl,
} from './urlController';
import { RedisClientType } from 'redis';

// Mock external modules
jest.mock('../services/urlServices');
jest.mock('../models/accessLogs.model');
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
}));

describe('URL Controller Tests', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();
  const mockRedisClient: Partial<RedisClientType> = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { app: { locals: { redisClient: mockRedisClient } } };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('createShortUrl Controller', () => {
    it('should successfully create and return a short URL', async () => {
      const mockLongUrl = 'http://cloudflare.com';
      const mockShortUrlId = 'cloudflare';
      (findOrCreateShortUrl as jest.Mock).mockResolvedValue(mockShortUrlId);
      mockReq.body = { longUrl: mockLongUrl };

      await createShortUrl(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findOrCreateShortUrl).toHaveBeenCalledWith(mockLongUrl);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        shortUrl: `www.shorturl.com/${mockShortUrlId}`,
      });
    });
    it('should call next with an error when findOrCreateShortUrl service fails', async () => {
      const error = new Error('Service Error');
      mockReq.body = { longUrl: 'http://cloudflare.com' };
      (findOrCreateShortUrl as jest.Mock).mockRejectedValue(error);

      await createShortUrl(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findOrCreateShortUrl).toHaveBeenCalledWith(
        'http://cloudflare.com'
      );
      expect(nextFunction).toHaveBeenCalledWith(error);
    });
  });

  describe('redirectToLongUrl Controller', () => {
    it('should redirect to long URL when short URL ID is valid', async () => {
      const mockShortUrlId = 'cloudflare';
      const mockLongUrl = 'http://cloudflare.com';
      mockReq.params = { shortUrlId: mockShortUrlId };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(mockLongUrl);

      await redirectToLongUrl(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.redirect).toHaveBeenCalledWith(301, mockLongUrl);
    });

    it('should handle when no cache or database entry exists', async () => {
      mockReq.params = { shortUrlId: 'nonexistent' };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(null);
      (findShortUrl as jest.Mock).mockRejectedValue(new Error('Not found'));

      await redirectToLongUrl(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findShortUrl).toHaveBeenCalledWith('nonexistent');
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('generateAnalytics Controller', () => {
    it('should return analytics data for a given short URL', async () => {
      const mockShortUrlId = 'cloudflare';
      const mockTimeFrame = '24h';
      const mockAccessCount = 5;
      mockReq.query = {
        shortUrlId: mockShortUrlId,
        timeFrame: mockTimeFrame,
      };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(null);
      (getAccessCountForShortUrl as jest.Mock).mockResolvedValue(
        mockAccessCount
      );

      await generateAnalytics(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        timeFrame: mockTimeFrame,
        accessCount: mockAccessCount,
      });
    });

    it('should handle unsupported time frames by treating them as "all"', async () => {
      mockReq.query = {
        shortUrlId: 'validShortId',
        timeFrame: 'unsupported',
      };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(null);
      (findShortUrl as jest.Mock).mockResolvedValue(true); // Simulate URL found
      (getAccessCountForShortUrl as jest.Mock).mockResolvedValue(10);

      await generateAnalytics(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findShortUrl).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        timeFrame: 'all',
        accessCount: 10,
      });
    });

    it('should return a 404 error if the short URL is not found', async () => {
      mockReq.query = { shortUrlId: 'nonexistent', timeFrame: '24h' };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(null);
      (findShortUrl as jest.Mock).mockRejectedValue(new Error('Not found'));

      await generateAnalytics(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findShortUrl).toHaveBeenCalledWith('nonexistent');
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle when no analytics data is available', async () => {
      mockReq.query = { shortUrlId: 'validShortId', timeFrame: '24h' };
      (mockRedisClient.get as jest.Mock).mockResolvedValue(null);
      (findShortUrl as jest.Mock).mockResolvedValue(true);
      (getAccessCountForShortUrl as jest.Mock).mockResolvedValue(0);

      await generateAnalytics(
        mockReq as Request,
        mockRes as Response,
        nextFunction
      );

      expect(findShortUrl).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        timeFrame: '24h',
        accessCount: 0,
      });
    });
  });
});
