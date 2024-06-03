import { shortUrlSchema, urlSchema } from '../';

/**
 * Validates if the input string is a valid short url id consisting of allowed characters.
 * @param input The input string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidShortUrl = (input: string): boolean => {
  try {
    shortUrlSchema.parse(input);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks whether a given input is a valid URL with HTTP or HTTPS protocol and proper structure.
 * @param input The string to be validated as a URL.
 * @returns boolean True if the input is a well-formed HTTP or HTTPS URL; false otherwise, including for non-string inputs or malformed URLs.
 */
export const isValidHttpUrl = (input: string): boolean => {
  try {
    urlSchema.parse(input);
    console.log('urlSchema', urlSchema.parse(input));
    return true;
  } catch (error) {
    return false;
  }
};
