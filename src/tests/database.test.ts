import { connectDatabase } from '../api/v1/services/database';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe('Database Connection', () => {
  it('should connect and ping the database successfully', async () => {
    const pingResult = await connectDatabase();

    expect(pingResult.ok).toBe(1);
  });
});
