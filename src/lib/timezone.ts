import { format as formatDate, parseISO } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";

const TIMEZONE = "Asia/Jerusalem";

export const timezone = {
  /**
   * Convert a Date object to Israel timezone for display
   */
  toLocalTime: (date: Date): Date => {
    return toZonedTime(date, TIMEZONE);
  },

  /**
   * Convert a local time (assumed to be in Israel timezone) to UTC for database storage
   */
  toUTC: (localDate: Date): Date => {
    return fromZonedTime(localDate, TIMEZONE);
  },

  /**
   * Format a date string from database (already in Asia/Jerusalem) for display
   */
  formatToLocal: (dateString: string, formatString: string = "HH:mm"): string => {
    // Parse the date and format it directly - it's already in the correct timezone
    const date = parseISO(dateString);
    return formatDate(date, formatString);
  },

  /**
   * Parse ISO string - treating it as already in Asia/Jerusalem timezone
   */
  parseToLocal: (dateString: string): Date => {
    // Parse directly since the stored time is already in Asia/Jerusalem timezone
    return parseISO(dateString);
  },

  /**
   * Create datetime-local input value from Date in local timezone
   */
  toDateTimeLocal: (date: Date): string => {
    const localDate = toZonedTime(date, TIMEZONE);
    return formatDate(localDate, "yyyy-MM-dd'T'HH:mm");
  },

  /**
   * Parse datetime-local input value and keep in Asia/Jerusalem timezone for storage
   */
  fromDateTimeLocal: (dateTimeLocal: string): string => {
    // Create a Date object from the local datetime input
    const localDate = new Date(dateTimeLocal);
    // Convert it to Asia/Jerusalem timezone and return as ISO string
    const zonedDate = toZonedTime(localDate, TIMEZONE);
    // Format it to include the timezone offset for Asia/Jerusalem
    return formatInTimeZone(localDate, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
  },

  /**
   * Get current date in local timezone for calendar/date selection
   */
  getCurrentLocalDate: (): Date => {
    return toZonedTime(new Date(), TIMEZONE);
  }
};