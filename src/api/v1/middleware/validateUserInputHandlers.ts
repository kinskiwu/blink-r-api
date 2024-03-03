import { Request, Response, NextFunction } from 'express';
import { isValidHttpUrl, isValidShortUrl } from '../../utils/helpers';

/**
 * Middleware to validate the input for a long url.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
export const validateLongUrlInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { longUrl } = req.body;

  if (longUrl && isValidHttpUrl(longUrl)) {
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid long URL' });
  }
};

/**
 * Middleware to validate the input for a short url.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */

export const validateShortUrlInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { shortUrlId } = req.params;

  if (shortUrlId && isValidShortUrl(shortUrlId)) {
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid short URL' });
  }
};
