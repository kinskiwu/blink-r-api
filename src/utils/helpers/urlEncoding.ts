import { allowedCharacters, base } from '../';
//todo: add collision test
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
