import { z } from 'zod';
import { allowedCharacters } from '../';

export const shortUrlSchema = z
  .string()
  .max(7)
  .refine((url) => {
    const regex = new RegExp(`^[${allowedCharacters}]+$`);
    return regex.test(url);
  }, 'Invalid characters in short URL');

export const urlSchema = z
  .string()
  .url()
  .refine((url) => {
    const parsedUrl = new URL(url);
    const hasValidProtocol =
      parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    const hasHostname = parsedUrl.hostname !== '';
    const hasCorrectSlashes = url.startsWith(`${parsedUrl.protocol}//`);
    return hasValidProtocol && hasHostname && hasCorrectSlashes;
  }, 'Invalid URL format or protocol');
