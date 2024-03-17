import { globalErrorHandler } from './globalErrorHandler';
import { Request, Response } from 'express';

describe('globalErrorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should handle a default error', () => {
    const err = new Error('An error occurred');
    globalErrorHandler(
      err as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An error occurred',
    });
  });

  it('should handle a custom error with custom status and message', () => {
    const err = {
      log: 'Custom error log',
      status: 404,
      message: { err: 'Custom error message' },
    };
    globalErrorHandler(
      err as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'Custom error message',
    });
  });

  it('should handle an error without log property', () => {
    const err = {
      status: 400,
      message: { err: 'Error without log' },
    };
    globalErrorHandler(
      err as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'Error without log',
    });
  });

  it('should handle an error without message property', () => {
    const err = {
      log: 'Error without message',
      status: 500,
    };
    globalErrorHandler(
      err as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An error occurred',
    });
  });

  it('should log the default error message when error object is empty', () => {
    globalErrorHandler(
      {} as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An error occurred',
    });
  });

  it('should log the default error message when error object is undefined', () => {
    globalErrorHandler(
      undefined as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An error occurred',
    });
  });
});
