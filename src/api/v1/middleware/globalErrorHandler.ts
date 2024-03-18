import { Request, Response } from 'express';

interface CustomError {
  log: string;
  status: number;
  message: string;
}

/**
 * Global error handler for Express that intercepts and standardizes error responses.
 * Logs error details for internal review and returns a structured error message to the client.
 * Defaults are provided for missing error properties to ensure a consistent response format.
 *
 * @param {CustomError} err - Error object potentially containing `log`, `status`, and `message`.
 * @param {Request} req - Express Request object, not directly used here.
 * @param {Response} res - Express Response object for sending the error response.
 */
export const globalErrorHandler = (
  err: CustomError,
  req: Request,
  res: Response
) => {
  const defaultErr: CustomError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: 'An error occurred',
  };

  // combine default error with custom props
  const errorObj = { ...defaultErr, ...err };
  console.log(errorObj.log);

  return res.status(errorObj.status).json(errorObj.message);
};
