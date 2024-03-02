import { Request, Response, NextFunction } from 'express';

class CustomError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Ensure instance prototype is set correctly
  }
}
// catch 404 error handler
export const notFoundErrorHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new CustomError('Not Found', 404));
};

// global error handler
export const globalErrorHandler = (err: CustomError, req: Request, res: Response) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    const responseMessage = process.env.NODE_ENV === 'production' ? 'Something went wrong' : message;
    // log error in dev mode
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
    }

    res.status(status).json({ error: responseMessage });
};
