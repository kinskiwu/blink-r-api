import express from 'express';
import { shortenUrl } from '../controllers/urlController';

const urlRouter = express.Router();

urlRouter.post('/shorten', shortenUrl);

export default urlRouter;