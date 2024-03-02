import express from 'express';
import { createShortUrl, generateAnalytics, redirectToLongUrl } from '../controllers/urlController';
import { validateUserInput } from '../middleware/validateUserInput';

const urlRouter = express.Router();

urlRouter.post('/shorten', validateUserInput, createShortUrl);

urlRouter.get('/:shortUrlId', validateUserInput, redirectToLongUrl);

urlRouter.get('/analytics', generateAnalytics);

export default urlRouter;