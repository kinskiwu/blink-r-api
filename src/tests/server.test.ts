import request from 'supertest';
import app from '../';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe('Not Found Error Handler', () => {
  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

describe('URL Shortening API', () => {
  describe('POST /api/v1/url/shorten', () => {
    it('should create a short URL', async () => {
      const longUrl = 'https://mockexample.com/randomLongUrl';
      const response = await request(app)
        .post('/api/v1/url/shorten')
        .send({ longUrl });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shortUrl');
    });
  });
});
