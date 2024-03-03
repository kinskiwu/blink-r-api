import { ErrorRequestHandler, Request, Response } from 'express';

/**
 * Global error handler function to catch and respond to errors occurring in middleware.
 * @param err - The error object or custom error passed from middleware.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object used to send a JSON response with error details.
 */

export const globalErrorHandler = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response
) => {
  // define default error structure
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };

  // combine default error with custom props
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);

  return res.status(errorObj.status).json(errorObj.message);
};
