import { Request, Response, NextFunction } from 'express';
import * as helpers from '../../utils/helpers';
import { validateLongUrlInput } from './validateUserInputHandlers';

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
