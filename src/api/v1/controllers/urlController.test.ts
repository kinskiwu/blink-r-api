import { Request, Response, NextFunction } from 'express';
import { findOrCreateShortUrl } from '../services/urlServices';
import { createShortUrl } from './urlController';

jest.mock('../services/urlServices', () => ({
  findOrCreateShortUrl: jest.fn(),
}));
jest.mock('../models/urls.model');
jest.mock('../models/accessLogs.model');
jest.mock('../../utils/helpers', () => ({
  calculateStartDate: jest.fn(),
}));

describe('createShortUrl Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should successfully create a short URL for a valid long URL', async () => {
    const mockLongUrl = 'http://cloudflare.com';
    const mockShortUrl = 'http://short.ly/cloudflare';
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

    expect(findOrCreateShortUrl).toHaveBeenCalledWith('http://cloudflare.com');
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
