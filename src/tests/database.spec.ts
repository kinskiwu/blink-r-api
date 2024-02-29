import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectDatabase } from '../api/v1/services/database';

describe('Database Connection', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // start mongomeoryserver
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // connect to in memory database
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // disconnect from in memory database & server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should connect and ping the database successfully', async () => {

    await connectDatabase();

    // test is successful if no error thrown
    expect(true).toBe(true);
  });
});
