import express from 'express';
import { createShortUrl, redirectToLongUrl } from '../controllers/urlController';
import { validateUrl } from '../middleware/validateUrl';

const urlRouter = express.Router();

urlRouter.post('/shorten', validateUrl, createShortUrl);

urlRouter.get('/:shortUrlId', validateUrl, redirectToLongUrl);

export default urlRouter;