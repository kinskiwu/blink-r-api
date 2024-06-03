import { UrlModel } from '../models/urls.model';
import { AccessLogModel } from '../models/accessLogs.model';
import { encodeToBase62 } from '../../../utils';
import { DatabaseError, NotFoundError } from '../../../config/errors';
import UrlService from './urlService';
import DatabaseService from './databaseService';

jest.mock('../models/urls.model');
jest.mock('../models/accessLogs.model');
jest.mock('../../../utils/helpers');

describe.skip('URL Functions Tests', () => {
  let urlServiceInstance: UrlService;

  beforeEach(() => {
    // Creating an instance of UrlService with mocked dependencies
    const urlDatabaseService = new DatabaseService(UrlModel);
    const accessLogDatabaseService = new DatabaseService(AccessLogModel);
    urlServiceInstance = new UrlService(
      urlDatabaseService,
      accessLogDatabaseService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShortUrl', () => {
    it('should generate a short URL from a custom uniqueId', () => {
      const customUniqueId = 'customUniqueId';
      const encodedValue = 'encodedValue';

      (encodeToBase62 as jest.Mock).mockReturnValue(encodedValue);

      // Testing the private method indirectly via a public method
      const shortUrl = (urlServiceInstance as any).encodeShortUrl(
        customUniqueId
      );

      expect(shortUrl).toBe(encodedValue);
      expect(encodeToBase62).toHaveBeenCalledWith(customUniqueId);
    });

    it('should generate a short URL with a new uuid if no uniqueId provided', () => {
      const encodedValue = 'encodedValue';
      (encodeToBase62 as jest.Mock).mockReturnValue(encodedValue);

      // Testing the private method indirectly via a public method
      const shortUrl = (urlServiceInstance as any).encodeShortUrl();

      expect(shortUrl).toBe(encodedValue);
      expect(encodeToBase62).toHaveBeenCalled();
    });
  });

  describe('findOrCreateShortUrl', () => {
    it('should create a new short URL for a given long URL', async () => {
      const longUrl = 'http://cloudflare.com';
      (UrlModel.findOne as jest.Mock).mockResolvedValue(null);
      (UrlModel.prototype.save as jest.Mock).mockResolvedValue({});
      const shortUrl = await urlServiceInstance.findOrCreateShortUrl(longUrl);
      expect(shortUrl).toBeDefined();
    });

    it('should throw a DatabaseError if database operation fails', async () => {
      const longUrl = 'http://cloudflare.com';
      (UrlModel.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      await expect(
        urlServiceInstance.findOrCreateShortUrl(longUrl)
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('findShortUrl', () => {
    it('should find a URL document based on short URL ID', async () => {
      const shortUrlId = 'validShortUrlId';
      (UrlModel.findOne as jest.Mock).mockResolvedValue({
        longUrl: 'http://cloudflare.com',
      });
      const urlDocument = await urlServiceInstance.findShortUrl(shortUrlId);
      expect(urlDocument).toBeDefined();
    });

    it('should throw a NotFoundError if URL document is not found', async () => {
      const shortUrlId = 'nonexistentShortUrlId';
      (UrlModel.findOne as jest.Mock).mockResolvedValue(null);
      await expect(urlServiceInstance.findShortUrl(shortUrlId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw a DatabaseError if database operation fails', async () => {
      const shortUrlId = 'validShortUrlId';
      (UrlModel.findOne as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      await expect(urlServiceInstance.findShortUrl(shortUrlId)).rejects.toThrow(
        DatabaseError
      );
    });
  });

  describe('getAccessCountForShortUrl', () => {
    it('should return the access count for a given short URL within a specified timeframe', async () => {
      const shortUrlId = 'validShortUrlId';
      const timeFrame = '24h';
      const accessCount = 5;
      (AccessLogModel.aggregate as jest.Mock).mockResolvedValue([
        { count: accessCount },
      ]);
      const count = await urlServiceInstance.getAccessCountForShortUrl(
        shortUrlId,
        timeFrame
      );
      expect(count).toBe(accessCount);
    });

    it('should return 0 if no access count found within the specified timeframe', async () => {
      const shortUrlId = 'validShortUrlId';
      const timeFrame = '24h';
      (AccessLogModel.aggregate as jest.Mock).mockResolvedValue([]);
      const count = await urlServiceInstance.getAccessCountForShortUrl(
        shortUrlId,
        timeFrame
      );
      expect(count).toBe(0);
    });

    it('should throw a DatabaseError if database operation fails', async () => {
      const shortUrlId = 'validShortUrlId';
      const timeFrame = '24h';
      (AccessLogModel.aggregate as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      await expect(
        urlServiceInstance.getAccessCountForShortUrl(shortUrlId, timeFrame)
      ).rejects.toThrow(DatabaseError);
    });
  });
});
