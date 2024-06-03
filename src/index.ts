import express, { Express, Request, Response } from 'express';
import urlRouter from './api/v1/routes/urlRouter';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { morganMiddleware } from './middlewares/morgan';
import { rateLimitMiddleware } from './middlewares/rateLimiter';
import { globalErrorHandler } from './middlewares/globalErrorHandler';

const app: Express = express();

// middlewares for request parsing
app.use(express.json({ limit: '5kb' }));
app.use(express.urlencoded({ extended: true }));

// cors middleware
app.use(cors());

// middleware for setting set HTTP headers
app.use(helmet());

// middleware for setting rate limit
app.use(rateLimitMiddleware);

// middleware for compressing response body
app.use(compression());

// deployment confirmation msg
app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

// Apply Morgan middleware to urlRouter
urlRouter.use(morganMiddleware);

// routing middle ware for url related endpoint
app.use('/api/v1/urls', urlRouter);

// middleware for 404 error handling
app.use((req: Request, res: Response) => {
  return res.status(404).json({ error: 'Not Found' });
});

// middleware for gloabl error handling
app.use(globalErrorHandler);

export default app;
