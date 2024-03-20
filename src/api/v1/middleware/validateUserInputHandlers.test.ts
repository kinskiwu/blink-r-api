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

describe('URL Input Validation Middlewares', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStatus = jest.fn().mockReturnThis();
    mockJson = jest.fn().mockReturnThis();
    res = { status: mockStatus, json: mockJson };
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('validateLongUrlInput', () => {
    describe('when input is valid', () => {
      it('should proceed to the next middleware', () => {
        const validUrl = 'https://validurl.com';
        (helpers.isValidHttpUrl as jest.Mock).mockReturnValue(true);
        req = { body: { longUrl: validUrl } };

        validateLongUrlInput(req as Request, res as Response, next);

        expect(helpers.isValidHttpUrl).toHaveBeenCalledWith(validUrl);
        expect(next).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
      });
    });

    describe('when input is invalid', () => {
      it.each([
        [123, 'number'],
        [null, 'null'],
        [undefined, 'undefined'],
        [{}, 'object'],
        [[], 'array'],
        [true, 'boolean'],
        ['ftp://cloudflare.com', 'invalid protocol'],
        ['httpss://cloudflare.com', 'typo in protocol'],
        ['://cloudflare.com', 'missing protocol'],
        ['http:/cloudflare.com', 'missing slash'],
        ['https:/cloudflare.com', 'missing slash'],
        ['http://', 'missing domain'],
        ['', 'empty string'],
      ])('should respond with 400 for %s', async (input, description) => {
        (helpers.isValidHttpUrl as jest.Mock).mockReturnValue(false);
        req = { body: { longUrl: input } };

        await validateLongUrlInput(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid long URL' });
      });
    });
  });

  describe('validateShortUrlInput', () => {
    describe('when input is valid', () => {
      it.each(['abc123', '1234567'])(
        'should proceed to the next middleware for %s',
        async (validShortUrlId) => {
          (helpers.isValidShortUrl as jest.Mock).mockReturnValue(true);
          req = { params: { shortUrlId: validShortUrlId } };

          await validateShortUrlInput(req as Request, res as Response, next);

          expect(helpers.isValidShortUrl).toHaveBeenCalledWith(validShortUrlId);
          expect(next).toHaveBeenCalled();
          expect(mockStatus).not.toHaveBeenCalled();
          expect(mockJson).not.toHaveBeenCalled();
        }
      );
    });

    describe('when input is invalid', () => {
      it.each([
        ['', 'empty string'],
        ['invalid$', 'contains special character'],
        ['12345678', 'exceeds length'],
        [null, 'null'],
        [undefined, 'undefined'],
      ])('should respond with 400 for %s', async (shortUrlId, description) => {
        (helpers.isValidShortUrl as jest.Mock).mockReturnValue(false);
        req = { params: { shortUrlId: shortUrlId as any } };

        await validateShortUrlInput(req as Request, res as Response, next);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid short URL' });
      });
    });
  });
});
