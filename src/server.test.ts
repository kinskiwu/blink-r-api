import request, {Response} from 'supertest';
import app from './server';

describe('GET /', () => {
  it('test example', async () => {
    const response: Response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'hi' });
  });
});