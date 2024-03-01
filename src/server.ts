import express, { Express, Request, Response, NextFunction } from 'express';
import { connectDatabase } from './api/v1/services/database';
import urlRouter from './api/v1/routes/urlRouter';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to database
connectDatabase();

// route users to urls router
app.use("/api/v1/url", urlRouter );

// example
app.get("/", (req: Request, res: Response) => {
    res.send({ message: 'hi' });
});

// catch 404
app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new Error('Not Found') as Error & { status: number };
    err.status = 404;
    next(err);
});

// glocal error handler
app.use((err: Error & { status?: number }, req: Request, res: Response) => {
    const status = err.status || 500;
    const message = err.message || 'An error occurred';
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    } else {
        console.log(err.message);
    }
    res.status(status).json({ error: message });
});

export default app;