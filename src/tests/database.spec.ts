import mongoose from 'mongoose';
import { connectDatabase } from '../api/v1/services/database';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe('Database Connection', () => {
  it('should connect and ping the database successfully', async () => {
    await connectDatabase();

    expect(mongoose.connection.readyState).toBe(1); // 1 for connected
  });
});