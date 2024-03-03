// converts a unique ID string to a base62 encoded string
const allowedCharacters =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base = allowedCharacters.length;

export const encodeToBase62 = (uniqueId: string): string => {
  // convert uniqueId into numeric value by summing the char codes of each char
  let numericValue = Array.from(uniqueId).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
  );
  let encodedString = '';

  // continuously divide num by the base and prepend the corresponding charto the encoded string
  while (numericValue > 0) {
    encodedString =
      allowedCharacters.charAt(numericValue % base) + encodedString;
    numericValue = Math.floor(numericValue / base);
  }

  return encodedString;
};

// chekck if input only contains allwed allowed characters
export const isValidShortUrl = (input: string): boolean => {
  //construct a regex matching only strings composed of allowed characters (^&$ ensures entire input must match)
  const regex = new RegExp(`^[${allowedCharacters}]+$`);
  return regex.test(input);
};

// check if input is a valid http url
export const isValidHttpUrl = (input: string): boolean => {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

// calculate start date based on given time frame
export const calculateStartDate = (timeFrame: string): Date => {
  const startDate = new Date();
  // default handles any unexpected timeFrame values to 'all'
  switch (timeFrame) {
    case '24h':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    default:
      return new Date(0);
  }

  return startDate;
};
