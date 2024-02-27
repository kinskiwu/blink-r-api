import mongoose, { Schema } from 'mongoose';
import { Url } from '../types/DbModelTypes';

const ShortUrlSchema = new Schema({
  shortUrlId: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const UrlSchema = new Schema({
  longUrlId: { type: String, required: true },
  longUrl: { type: String, required: true },
  shortUrls: [ShortUrlSchema],
  createdAt: { type: Date, required: true, default: Date.now },
});

export const UrlModel = mongoose.model<Url>('Url', UrlSchema);