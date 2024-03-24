import { Document } from 'mongoose';

export interface ShortUrl {
  shortUrlId: string;
  createdAt?: Date;
}

export interface Url extends Document {
  longUrl: string;
  shortUrls: ShortUrl[];
  createdAt?: Date;
}

export interface AccessLog extends Document {
  accessTime: Date;
  shortUrlId: string;
}
