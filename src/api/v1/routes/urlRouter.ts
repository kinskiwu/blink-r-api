import express from 'express';
import { createShortUrl } from '../controllers/urlController';

const urlRouter = express.Router();

urlRouter.post('/shorten', createShortUrl);

export default urlRouter;