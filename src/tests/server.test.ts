import request from 'supertest';
import app from '../';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

// afterEach(async () => await clearDB());

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

  describe('GET /api/v1/url/:shortUrlId', () => {
    it('should return either 400 (or 404 if empty string) when input an invalid short url id', async () => {
      const invalidShortUrlId1 = 'thisIdDoesntExist';
      const invalidShortUrlId2 = '$123';
      const invalidShortUrlId3 = '';
      const response1 = await request(app).get(
        `/api/v1/url/${invalidShortUrlId1}`
      );
      const response2 = await request(app).get(
        `/api/v1/url/${invalidShortUrlId2}`
      );
      const response3 = await request(app).get(
        `/api/v1/url/${invalidShortUrlId3}`
      );

      expect(response1.status).toBe(400);
      expect(response2.status).toBe(400);
      expect(response3.status).toBe(404);
    });
  });

  describe('GET /api/v1/url/analytics', () => {
    it('should return 400 when input an invalid short url id', async () => {
      const invalidShortUrlId = 'Hv';
      const timeFrame = '24h';
      const response = await request(app)
        .get('/api/v1/url/analytics')
        .query({ shortUrlId: invalidShortUrlId, timeFrame });

      expect(response.status).toBe(400);
    });
  });
});
