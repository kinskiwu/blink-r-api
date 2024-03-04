import { AccessLogModel } from '../api/v1/models/accessLogs.model';
import { UrlModel } from '../api/v1/models/urls.model';
import { setupDB, teardownDB, clearDB } from './jest_mongodb_setup';

beforeAll(async () => await setupDB());

afterEach(async () => await clearDB());

afterAll(async () => await teardownDB());

describe('AccessLog Model Test', () => {
  it('create & save access log successfully', async () => {
    const validAccessLog = new AccessLogModel({
      shortUrlId: 'someShortUrlId',
    });
    const savedAccessLog = await validAccessLog.save();

    expect(savedAccessLog._id).toBeDefined();
    expect(savedAccessLog.accessTime).toBeDefined();
    expect(savedAccessLog.shortUrlId).toBe('someShortUrlId');
  });
});

describe('UrlModel Tests', () => {
  it('should create and save UrlModel successfully', async () => {
    const urlData = {
      longUrlId: '123',
      longUrl: 'https://mockexample.com',
      shortUrls: [{ shortUrlId: 'abc123', createdAt: new Date() }],
    };
    const validUrl = new UrlModel(urlData);
    const savedUrl = await validUrl.save();

    expect(savedUrl._id).toBeDefined();
    expect(savedUrl.longUrlId).toBe(urlData.longUrlId);
    expect(savedUrl.longUrl).toBe(urlData.longUrl);
    expect(savedUrl.shortUrls.length).toBe(1);
  });
});
