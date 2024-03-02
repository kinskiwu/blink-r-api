import express from 'express';
import { createShortUrl, redirectToLongUrl } from '../controllers/urlController';

const urlRouter = express.Router();

urlRouter.post('/shorten', createShortUrl);

urlRouter.get('/:shortUrlId', redirectToLongUrl);

export default urlRouter;