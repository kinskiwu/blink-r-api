import {
  CacheError,
  CustomError,
  DatabaseError,
  NotFoundError,
} from './errors';

describe('Custom Error Classes Tests', () => {
  describe('CustomError', () => {
    it('should correctly set status and message', () => {
      const status = 400;
      const message = 'Bad Request';
      const error = new CustomError(status, message);

      expect(error.status).toBe(status);
      expect(error.message).toBe(message);
    });
  });

  describe('NotFoundError', () => {
    it('should correctly extend CustomError with status 404 and default message', () => {
      const error = new NotFoundError();

      expect(error.status).toBe(404);
      expect(error.message).toBe('Not Found');
    });

    it('should correctly extend CustomError with status 404 and custom message', () => {
      const customMessage = 'Custom Not Found';
      const error = new NotFoundError(customMessage);

      expect(error.status).toBe(404);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('DatabaseError', () => {
    it('should correctly extend CustomError with status 500 and default message', () => {
      const error = new DatabaseError();

      expect(error.status).toBe(500);
      expect(error.message).toBe('Database Error');
    });

    it('should correctly extend CustomError with status 500 and custom message', () => {
      const customMessage = 'Custom Database Error';
      const error = new DatabaseError(customMessage);

      expect(error.status).toBe(500);
      expect(error.message).toBe(customMessage);
    });
  });

  describe('CacheError', () => {
    it('should correctly extend CustomError with status 500 and default message', () => {
      const error = new CacheError();

      expect(error.status).toBe(500);
      expect(error.message).toBe('Cache Error');
    });

    it('should correctly extend CustomError with status 500 and custom message', () => {
      const customMessage = 'Custom Cache Error';
      const error = new CacheError(customMessage);

      expect(error.status).toBe(500);
      expect(error.message).toBe(customMessage);
    });
  });
});
