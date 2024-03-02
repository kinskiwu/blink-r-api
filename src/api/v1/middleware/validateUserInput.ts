import { Request, Response, NextFunction } from 'express';
import { isValidInput } from '../services/helpers';

export const validateUserInput = (req: Request, res: Response, next: NextFunction ) => {
  const { input } = req.body || req.params;

  if(isValidInput(input)){
    return next();
  } else {
    return res.status(400).json({ error: 'Invalid URL'});
  }
}
