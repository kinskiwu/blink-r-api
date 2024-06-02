import { CacheError, DatabaseError, NotFoundError } from '../config/errors';
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

  it('should handle a default error correctly', () => {
    const err = new Error('An unexpected error occurred');
    globalErrorHandler(err, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    });
  });

  it('should handle NotFoundError with a 404 status', () => {
    const err = new NotFoundError('Resource not found');
    globalErrorHandler(err, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'Resource not found',
    });
  });

  it('should handle DatabaseError with a 500 status', () => {
    const err = new DatabaseError('Database connection error');
    globalErrorHandler(err, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'Database connection error',
    });
  });

  it('should handle CacheError with a 500 status', () => {
    const err = new CacheError('Cache retrieval failed');
    globalErrorHandler(err, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'Cache retrieval failed',
    });
  });

  it('should handle errors thrown as plain objects', () => {
    const err = { someProperty: 'This is an object thrown as an error' };
    globalErrorHandler(
      err as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    });
  });

  it('should handle errors without a message', () => {
    const err = new Error();
    globalErrorHandler(err, mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    });
  });

  it('should properly handle a null error', () => {
    globalErrorHandler(
      null as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    });
  });

  it('should properly handle an undefined error', () => {
    globalErrorHandler(
      undefined as any,
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      err: 'An unexpected error occurred.',
    });
  });
});
