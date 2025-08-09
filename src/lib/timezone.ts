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
   * Format a date string from database to local time display
   */
  formatToLocal: (dateString: string, formatString: string = "HH:mm"): string => {
    return formatInTimeZone(dateString, TIMEZONE, formatString);
  },

  /**
   * Parse ISO string and convert to local timezone
   */
  parseToLocal: (dateString: string): Date => {
    const date = parseISO(dateString);
    return toZonedTime(date, TIMEZONE);
  },

  /**
   * Create datetime-local input value from Date in local timezone
   */
  toDateTimeLocal: (date: Date): string => {
    const localDate = toZonedTime(date, TIMEZONE);
    return formatDate(localDate, "yyyy-MM-dd'T'HH:mm");
  },

  /**
   * Parse datetime-local input value and convert to UTC for storage
   */
  fromDateTimeLocal: (dateTimeLocal: string): string => {
    // Create a date object assuming the input is in local timezone
    const localDate = new Date(dateTimeLocal);
    const utcDate = fromZonedTime(localDate, TIMEZONE);
    return utcDate.toISOString();
  },

  /**
   * Get current date in local timezone for calendar/date selection
   */
  getCurrentLocalDate: (): Date => {
    return toZonedTime(new Date(), TIMEZONE);
  }
};