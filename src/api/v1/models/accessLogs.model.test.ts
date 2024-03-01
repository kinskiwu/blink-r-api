import mongoose from 'mongoose';
import { AccessLogModel } from './accessLogs.model';
import { setupDB, teardownDB, clearDB } from '../../../tests/jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe('AccessLog Model Test', () => {
  it('create & save access log successfully', async () => {
    const validAccessLog = new AccessLogModel({
      shortUrlId: 'someShortUrlId'
    });
    const savedAccessLog = await validAccessLog.save();

    expect(savedAccessLog._id).toBeDefined();
    expect(savedAccessLog.accessTime).toBeDefined();
    expect(savedAccessLog.shortUrlId).toBe('someShortUrlId');
  });

  // todo: more tests to be added
});
