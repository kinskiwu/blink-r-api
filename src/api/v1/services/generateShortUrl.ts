import { v4 as uuid } from 'uuid';
import { encodeToBase62 } from '../../utils/helpers';

/**
 * Generates a short URL identifier.
 *
 * @param {string} uniqueId - An optional parameter to provide a custom unique identifier.
 *                            If not provided, a new uuid will be generated.
 * @returns {string} - The base62 encoded string of the uniqueId, acting as a short URL identifier.
 */
export const generateShortUrl = (uniqueId: string = uuid()): string => {
  return encodeToBase62(uniqueId);
};
