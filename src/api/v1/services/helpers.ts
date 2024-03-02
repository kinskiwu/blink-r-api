// converts a unique ID string to a base62 encoded string
const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = characters.length;

export const encodeToBase62 = (uniqueId: string): string => {
  // convert uniqueId into numeric value by summing the char codes of each char
  let numericValue = Array.from(uniqueId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let encodedString = '';

  // continuously divide num by the base and prepend the corresponding charto the encoded string
  while (numericValue > 0) {
    encodedString = characters.charAt(numericValue % base) + encodedString;
    numericValue = Math.floor(numericValue / base);
  }

  return encodedString;
}

// validate url is a string
export const isValidUrl = (url) => typeof url === 'string' && url.trim() !== '';
