import { Request, Response, NextFunction } from 'express';
import * as helpers from '../../utils/helpers';
import {
  validateLongUrlInput,
  validateShortUrlInput,
} from './validateUserInputHandlers';

jest.mock('../../utils/helpers', () => ({
  isValidHttpUrl: jest.fn(),
  isValidShortUrl: jest.fn(),
}));

describe('validateLongUrlInput Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStatus = jest.fn();
    mockJson = jest.fn();
    res = {
      status: mockStatus.mockReturnThis(),
      json: mockJson.mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('valid inputs', () => {
    it('should call next() for valid http and https URLs', () => {
      (helpers.isValidHttpUrl as jest.Mock).mockReturnValue(true);
      req = { body: { longUrl: 'https://validurl.com' } };

      validateLongUrlInput(req as Request, res as Response, next);

      expect(helpers.isValidHttpUrl).toHaveBeenCalledWith(
        'https://validurl.com'
      );
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('invalid inputs', () => {
    it('should respond with 400 status for non-string inputs', () => {
      const inputs = [123, null, undefined, {}, [], true];
      inputs.forEach((input) => {
        (helpers.isValidHttpUrl as jest.Mock).mockReturnValue(false);
        req = { body: { longUrl: input } };

        validateLongUrlInput(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid long URL' });
      });
    });

    it.each([
      'ftp://cloudflare.com',
      'httpss://cloudflare.com',
      '://cloudflare.com',
      'http:/cloudflare.com',
      'https:/cloudflare.com',
      'http://',
      '',
    ])('should respond with 400 status for invalid URL: %s', (url) => {
      (helpers.isValidHttpUrl as jest.Mock).mockReturnValue(false);
      req = { body: { longUrl: url } };

      validateLongUrlInput(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid long URL' });
    });
  });
});

describe('validateShortUrlInput Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStatus = jest.fn();
    mockJson = jest.fn();
    res = {
      status: mockStatus.mockReturnThis(),
      json: mockJson.mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should call next() for valid shortUrlId', () => {
    const validShortUrlIds = ['abc123', '1234567'];
    validShortUrlIds.forEach((validShortUrlId) => {
      (helpers.isValidShortUrl as jest.Mock).mockReturnValue(true);
      req = { params: { shortUrlId: validShortUrlId } };

      validateShortUrlInput(req as Request, res as Response, next);

      expect(helpers.isValidShortUrl).toHaveBeenCalledWith(validShortUrlId);
      expect(next).toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  it.each(['', 'invalid$', '12345678', null, undefined])(
    'should respond with 400 status for invalid shortUrlId: %s',
    (shortUrlId) => {
      (helpers.isValidShortUrl as jest.Mock).mockReturnValue(false);
      req = { params: { shortUrlId: shortUrlId as any } }; // Using type casting to bypass TypeScript checks

      validateShortUrlInput(req as Request, res as Response, next);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid short URL' });
    }
  );

  it('should handle cases where shortUrlId is not provided', () => {
    req = { params: {} };

    validateShortUrlInput(req as Request, res as Response, next);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid short URL' });
  });
});
