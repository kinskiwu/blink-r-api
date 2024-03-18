import { Request, Response, NextFunction } from 'express';
import {
  findOrCreateShortUrl,
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
  });

  describe('generateAnalytics Controller', () => {
    it('should return analytics data for a given short URL', async () => {
      const mockShortUrlId = 'cloudflare';
      const mockTimeFrame = '24h';
      const mockAccessCount = 5;
      mockReq.query = { shortUrlId: mockShortUrlId, timeFrame: mockTimeFrame };
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
  });
});
