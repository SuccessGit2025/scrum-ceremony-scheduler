/**
 * Date serialization utilities
 * ISO 8601 format serialization and parsing
 */

/**
 * Serialize a date to ISO 8601 format (YYYY-MM-DD)
 * @param date The date to serialize
 * @returns ISO 8601 formatted date string
 */
export function serializeDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO 8601 date string (YYYY-MM-DD)
 * @param dateString ISO 8601 formatted date string
 * @returns Parsed Date object
 * @throws Error if the date string is invalid
 */
export function parseDate(dateString: string): Date {
  // Validate format: YYYY-MM-DD
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!iso8601Pattern.test(dateString)) {
    throw new Error(`Invalid ISO 8601 date format: ${dateString}. Expected format: YYYY-MM-DD`);
  }
  
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  // Validate ranges
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be between 1 and 12`);
  }
  
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Must be between 1 and 31`);
  }
  
  // Create date (month is 0-indexed in JavaScript Date)
  const date = new Date(year, month - 1, day);
  
  // Verify the date is valid (handles cases like Feb 31)
  if (date.getFullYear() !== year || 
      date.getMonth() !== month - 1 || 
      date.getDate() !== day) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  return date;
}
