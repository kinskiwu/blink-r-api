import express, { Express, Request, Response } from 'express';
import urlRouter from './api/v1/routes/urlRouter';
import { globalErrorHandler } from './api/v1/middleware/globalErrorHandler';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route users to urls router
app.use('/api/v1/url', urlRouter);

// catch 404 error handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// global error handler
app.use(globalErrorHandler);

export default app;
