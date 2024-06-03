import mongoose, { Schema } from 'mongoose';
import { AccessLog } from '../types/dbModelTypes';

const AccessLogSchema = new Schema(
  {
    accessTime: { type: Date, required: true, default: Date.now },
    shortUrlId: { type: String, required: true },
  },
  {
    timeseries: {
      timeField: 'accessTime',
      metaField: 'shortUrlId',
      granularity: 'seconds',
    },
  }
);

export const AccessLogModel = mongoose.model<AccessLog>(
  'AccessLog',
  AccessLogSchema
);
