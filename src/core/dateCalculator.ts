/**
 * Date Calculator Module
 * Handles all date-related calculations including release dates and working days
 */

import { Holiday } from './types.js';

/**
 * Calculate the third Saturday of a given month
 */
export function calculateThirdSaturday(year: number, month: number): Date {
  // Month is 1-indexed (1 = January, 12 = December)
  // JavaScript Date uses 0-indexed months, so subtract 1
  const firstDayOfMonth = new Date(year, month - 1, 1);
  
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculate days until first Saturday
  // If first day is Sunday (0), first Saturday is 6 days away
  // If first day is Saturday (6), first Saturday is 0 days away
  const daysUntilFirstSaturday = (6 - firstDayOfWeek + 7) % 7;
  
  // First Saturday is at day (1 + daysUntilFirstSaturday)
  // Third Saturday is 14 days after first Saturday
  const thirdSaturdayDay = 1 + daysUntilFirstSaturday + 14;
  
  return new Date(year, month - 1, thirdSaturdayDay);
}

/**
 * Get all working days between two dates, excluding weekends and holidays
 */
export function getWorkingDays(startDate: Date, endDate: Date, holidays: Date[]): Date[] {
  const workingDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  // Iterate through each day from start to end (inclusive)
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, holidays)) {
      workingDays.push(new Date(currentDate));
    }
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

/**
 * Check if a date is a working day (not weekend or holiday)
 */
export function isWorkingDay(date: Date, holidays: Date[]): boolean {
  const dayOfWeek = date.getDay();
  
  // Check if weekend (0 = Sunday, 6 = Saturday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  // Check if holiday
  const dateStr = date.toISOString().split('T')[0];
  for (const holiday of holidays) {
    const holidayStr = holiday.toISOString().split('T')[0];
    if (dateStr === holidayStr) {
      return false;
    }
  }
  
  return true;
}

/**
 * Add a number of working days to a date
 */
export function addWorkingDays(date: Date, days: number, holidays: Date[]): Date {
  const result = new Date(date);
  let workingDaysAdded = 0;
  
  while (workingDaysAdded < days) {
    // Move to next day
    result.setDate(result.getDate() + 1);
    
    // Check if it's a working day
    if (isWorkingDay(result, holidays)) {
      workingDaysAdded++;
    }
  }
  
  return result;
}


/**
 * Generate release dates for a list of months
 * @param months Array of {year, month} objects
 * @returns Array of release dates (third Saturday of each month)
 */
export function generateReleaseDates(months: Array<{ year: number; month: number }>): Date[] {
  return months.map(({ year, month }) => calculateThirdSaturday(year, month));
}

/**
 * Generate all 12 release dates for a given year
 * @param year The year to generate release dates for
 * @returns Array of 12 release dates (one for each month)
 */
export function generateReleaseDatesForYear(year: number): Date[] {
  const months = Array.from({ length: 12 }, (_, i) => ({ year, month: i + 1 }));
  return generateReleaseDates(months);
}

/**
 * Calculate sprint start date from release date
 * Sprint starts a certain number of weeks before the release date
 * @param releaseDate The release date (third Saturday of month)
 * @param sprintDurationWeeks Duration of sprint in weeks
 * @returns Sprint start date
 */
export function calculateSprintStart(releaseDate: Date, sprintDurationWeeks: number): Date {
  const sprintStart = new Date(releaseDate);
  // Move back by sprint duration in weeks
  sprintStart.setDate(sprintStart.getDate() - (sprintDurationWeeks * 7));
  return sprintStart;
}

/**
 * Calculate sprint end date from start date and duration
 * @param sprintStart The sprint start date
 * @param sprintDurationWeeks Duration of sprint in weeks
 * @returns Sprint end date
 */
export function calculateSprintEnd(sprintStart: Date, sprintDurationWeeks: number): Date {
  const sprintEnd = new Date(sprintStart);
  // Add sprint duration in weeks, then subtract 1 day to get last day of sprint
  sprintEnd.setDate(sprintEnd.getDate() + (sprintDurationWeeks * 7) - 1);
  return sprintEnd;
}

/**
 * Calculate ceremony date by applying day offset to a base date
 * @param baseDate The base date (e.g., sprint start or release date)
 * @param dayOffset Number of days to offset (can be negative)
 * @param timeOfDay Time in HH:MM format
 * @returns Date with time applied
 */
export function calculateCeremonyDate(
  baseDate: Date,
  dayOffset: number,
  timeOfDay: string
): Date {
  const ceremonyDate = new Date(baseDate);
  ceremonyDate.setDate(ceremonyDate.getDate() + dayOffset);
  
  // Parse time
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  ceremonyDate.setHours(hours, minutes, 0, 0);
  
  return ceremonyDate;
}
