/**
 * Calculates the start date from the current date based on the specified time frame.
 * @param timeFrame The time frame to calculate the start date for ('24h' or '7d').Default to 'all' if empty string provided.
 * @returns The calculated start date.
 */
export const calculateStartDate = (timeFrame: string): Date => {
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
