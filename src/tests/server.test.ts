import request from 'supertest';
import app from '../';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe.skip('Not Found Error Handler', () => {
  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});

describe.skip('GET / endpoint', () => {
  it('should return a 200 status and a confirmation message', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Hey this is my API running 🥳');
  });
});

describe.skip('URL Shortening API', () => {
  describe('POST /api/v1/urls/shorten', () => {
    it('should create a short URL for a valid long URL', async () => {
      const longUrl = 'https://cloudflare.com/randomLongUrl';
      const response = await request(app)
        .post('/api/v1/url/shorten')
        .send({ longUrl });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('shortUrl');
    });

    it('should return 400 for invalid long URL inputs', async () => {
      const invalidLongUrls = [
        '',
        'invalid-url',
        'ftp://cloudflare.com/randomLongUrl',
      ];
      for (const longUrl of invalidLongUrls) {
        const response = await request(app)
          .post('/api/v1/urls/shorten')
          .send({ longUrl });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid long URL');
      }
    });
  });

  describe.skip('GET /api/v1/urls/:shortUrlId', () => {
    it('should return either 400 (or 404 if empty) when input an invalidShortUrlId', async () => {
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

  describe.skip('GET /api/v1/urls/analytics', () => {
    it('should return analytics data', async () => {
      const shortUrlIdNotExist = 'Hv';
      const timeFrame = '24h';
      const response = await request(app)
        .get('/api/v1/url/analytics')
        .query({ shortUrlId: shortUrlIdNotExist, timeFrame });
      expect(response.status).toBe(400);
    });
  });
});
