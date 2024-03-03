import request from 'supertest';
import app from '../';

describe('Not Found Error Handler', () => {
  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});
