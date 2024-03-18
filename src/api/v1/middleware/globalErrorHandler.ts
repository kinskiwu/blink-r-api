import { Request, Response } from 'express';
import { CustomError } from '../../utils/errors';

/**
 * Global error handler for Express that intercepts and standardizes error responses.
 * Logs error details for internal review and returns a structured error message to the client.
 * Defaults are provided for missing error properties to ensure a consistent response format.
 *
 * @param {CustomError} err - Error object potentially containing `log`, `status`, and `message`.
 * @param {Request} req - Express Request object, not directly used here.
 * @param {Response} res - Express Response object for sending the error response.
 */
type ErrorHandlerError = Error | CustomError;

export const globalErrorHandler = (
  error: ErrorHandlerError,
  req: Request,
  res: Response
) => {
  if (error instanceof CustomError) {
    console.error(`${error.constructor.name}: ${error.message}`);
    return res.status(error.status).json({ error: error.message });
  } else {
    console.error(`Unexpected error: ${error.message}`);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
};
