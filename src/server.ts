import express, { Express, Request, Response, NextFunction } from 'express';
import "dotenv/config";

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'An error occurred';
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    } else {
        console.log(err.message);
    }
    res.status(status).json({ error: message });
});

export default app.listen(PORT, () => console.log('listening on port ', PORT));