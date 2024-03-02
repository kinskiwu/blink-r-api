import express from 'express';
import { createShortUrl, generateAnalytics, redirectToLongUrl } from '../controllers/urlController';
import { validateLongUrlInput, validateShortUrlInput } from '../middleware/validateUserInputHandler';

const urlRouter = express.Router();

urlRouter.post('/shorten', validateLongUrlInput, createShortUrl);

urlRouter.get('/:shortUrlId', validateShortUrlInput, redirectToLongUrl);

urlRouter.get('/analytics', generateAnalytics);

export default urlRouter;