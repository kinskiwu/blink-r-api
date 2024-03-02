import { Request, Response, NextFunction } from 'express';
import { isValidUrl } from '../services/helpers';

export const validateUrl = (req: Request, res: Response, next: NextFunction ) => {
  const { url } = req.body || req.params;

  if(isValidUrl(url)){
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid URL'});
  }
}
