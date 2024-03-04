// converts a unique ID string to a base62 encoded string
const allowedCharacters =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = allowedCharacters.length;

/**
 * Encodes a unique ID into a Base62 string.
 * @param uniqueId The unique ID to encode.
 * @returns The encoded Base62 string.
 */
export const encodeToBase62 = (uniqueId: string): string => {
  let numericValue = Array.from(uniqueId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  let encodedString = '';

  while (numericValue > 0) {
    encodedString =
      allowedCharacters.charAt(numericValue % base) + encodedString;
    numericValue = Math.floor(numericValue / base);
  }

  return encodedString;
};

/**
 * Validates if the input string is a valid short url id consisting of allowed characters.
 * @param input The input string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidShortUrl = (input): boolean => {
  if (typeof input !== 'string') return false;

  const regex = new RegExp(`^[${allowedCharacters}]+$`);
  return regex.test(input);
};

/**
 * Validates if the input string is a valid HTTP url.
 * @param input The input string to validate.
 * @returns True if the URL is valid and uses HTTP or HTTPS protocol, false otherwise.
 */
export const isValidHttpUrl = (input): boolean => {
  try {
    if (typeof input !== 'string') return false;

    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

/**
 * Calculates the start date from the current date based on the specified time frame.
 * @param timeFrame The time frame to calculate the start date for ('24h' or '7d').Default to 'all' if empty string provided.
 * @returns The calculated start date.
 */
export const calculateStartDate = (timeFrame: string = 'all'): Date => {
  const currentDate = new Date();
  // default handles any unexpected timeFrame values to 'all'
  switch (timeFrame) {
    case '24h':
      currentDate.setDate(currentDate.getDate() - 1);
      break;
    case '7d':
      currentDate.setDate(currentDate.getDate() - 7);
      break;
    default:
      return new Date(0);
  }

  return currentDate;
};
