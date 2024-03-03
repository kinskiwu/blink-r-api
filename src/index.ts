import express, { Express, Request, Response } from 'express';
import urlRouter from './api/v1/routes/urlRouter';
import { globalErrorHandler } from './api/v1/middleware/globalErrorHandler';

const app: Express = express();

// middlewares for request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// deployment confirmation msg
app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳');
});

// routing middle ware for url related endpoint
app.use('/api/v1/url', urlRouter);

// middleware for handling 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// moddleware for gloabl error handling
app.use(globalErrorHandler);

export default app;
