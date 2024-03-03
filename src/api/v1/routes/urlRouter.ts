import express from 'express';
import {
  createShortUrl,
  generateAnalytics,
  redirectToLongUrl,
} from '../controllers/urlController';
import {
  validateLongUrlInput,
  validateShortUrlInput,
} from '../middleware/validateUserInputHandlers';

const urlRouter = express.Router();

// POST: shorten a given long url
urlRouter.post('/shorten', validateLongUrlInput, createShortUrl);

// GET: retrieve analytics for a short url within an optional timeframe
urlRouter.get('/analytics', generateAnalytics);

// GET: redirect to the original long url from a short url
urlRouter.get('/:shortUrlId', validateShortUrlInput, redirectToLongUrl);

export default urlRouter;
