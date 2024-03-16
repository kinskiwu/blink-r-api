import { rateLimit } from 'express-rate-limit';

// Rate limit middleware to limit each IP to 30 requests per minute
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'You have exceeded your 30 requests per minute limit.',
  headers: true,
});
