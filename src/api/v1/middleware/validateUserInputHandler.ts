import { Request, Response, NextFunction } from 'express';
import { isValidHttpUrl, isValidShortUrl } from '../services/helpers';

export const validateLongUrlInput = (req: Request, res: Response, next: NextFunction ) => {
  const { longUrl } = req.body;

  if(longUrl && isValidHttpUrl(longUrl)){
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid long URL'});
  }
}

export const validateShortUrlInput = (req: Request, res: Response, next: NextFunction ) => {
  const { shortUrlId } = req.params;

  if(shortUrlId && isValidShortUrl(shortUrlId)){
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid short URL'});
  }
}
