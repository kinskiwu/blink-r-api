import { v4 as uuid } from 'uuid';
import { encodeToBase62 } from './helpers';

export const generateShortUrl = (uniqueId: string = uuid()) : string => {
  return encodeToBase62(uniqueId);
}
