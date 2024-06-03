import mongoose, { Schema } from 'mongoose';
import type { Url } from '../types/dbModelTypes';

const ShortUrlSchema = new Schema({
  _id: { type: String, unique: true, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const UrlSchema = new Schema({
  longUrl: { type: String, unique: true, required: true, index: true },
  shortUrls: [ShortUrlSchema],
  createdAt: { type: Date, required: true, default: Date.now },
});

export const UrlModel = mongoose.model<Url>('Url', UrlSchema);
