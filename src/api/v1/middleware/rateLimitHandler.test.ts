import express, { Request, Response } from 'express';
import request from 'supertest';
import { rateLimitMiddleware } from './rateLimitHandler';

const app = express();
const agent = request(app);

app.use(rateLimitMiddleware);

app.get('/test', (req: Request, res: Response) => {
  res.send('Test endpoint');
});
// todo: add additional tests
describe('Rate Limit Middleware', () => {
  it('should allow requests below the rate limit', async () => {
    for (let i = 0; i < 20; i++) {
      await agent.get('/test').expect(200);
    }
  });
});
