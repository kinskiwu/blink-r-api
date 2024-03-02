import { ErrorRequestHandler, Request, Response } from 'express';

// global error handler
export const globalErrorHandler = (err: ErrorRequestHandler, req: Request, res: Response) => {
    const defaultErr = {
      log: 'Express error handler caught unknown middleware error',
      status: 500,
      message: { err: 'An error occurred' },
    };

    const errorObj = Object.assign({}, defaultErr, err);
    console.log(errorObj.log);

    return res.status(errorObj.status).json(errorObj.message);
};
