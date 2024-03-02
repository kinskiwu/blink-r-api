import express, { Express} from 'express';
import { connectDatabase } from './api/v1/services/database';
import urlRouter from './api/v1/routes/urlRouter';
import { globalErrorHandler, notFoundErrorHandler } from './api/v1/middleware/errorHandlers';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to database
connectDatabase();

// route users to urls router
app.use("/api/v1/url", urlRouter );

// route users to catch 404 error handler
app.use(notFoundErrorHandler);

// global error handler
app.use(globalErrorHandler);

export default app;