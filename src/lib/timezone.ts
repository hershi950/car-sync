import { format as formatDate, parseISO } from "date-fns";

export const timezone = {
  /**
   * Format a date string from database for display (raw value, no conversion)
   */
  formatToLocal: (dateString: string, formatString: string = "HH:mm"): string => {
    // Parse and format the raw datetime string exactly as stored
    const date = parseISO(dateString);
    return formatDate(date, formatString);
  },

  /**
   * Parse ISO string directly (no timezone conversion)
   */
  parseToLocal: (dateString: string): Date => {
    // Parse directly with no conversion
    return parseISO(dateString);
  },

  /**
   * Create datetime-local input value from Date (no conversion)
   */
  toDateTimeLocal: (date: Date): string => {
    // Format directly without timezone conversion
    return formatDate(date, "yyyy-MM-dd'T'HH:mm");
  },

  /**
   * Parse datetime-local input value for storage (no conversion)
   */
  fromDateTimeLocal: (dateTimeLocal: string): string => {
    // Return the datetime string exactly as entered for storage
    // Add seconds if not present to make it a valid ISO string
    if (dateTimeLocal.length === 16) {
      return dateTimeLocal + ":00";
    }
    return dateTimeLocal;
  },

  /**
   * Get current date (no timezone conversion)
   */
  getCurrentLocalDate: (): Date => {
    return new Date();
  }
};