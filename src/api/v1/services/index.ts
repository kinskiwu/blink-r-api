import UrlService from './urlService';
import CacheService from './cacheService';
import DatabaseService from './databaseService';
import { UrlModel } from '../models/urls.model';
import { AccessLogModel } from '../models/accessLogs.model';

const urlDatabaseService = new DatabaseService(UrlModel);
const accessLogDatabaseService = new DatabaseService(AccessLogModel);

const urlService = new UrlService(urlDatabaseService, accessLogDatabaseService);
const cacheService = new CacheService();

export {
  urlService,
  cacheService,
  urlDatabaseService,
  accessLogDatabaseService,
};
