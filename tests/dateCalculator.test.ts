/**
 * Date Calculator Tests
 * Property-based and unit tests for date calculation functions
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  calculateThirdSaturday, 
  getWorkingDays, 
  isWorkingDay, 
  addWorkingDays,
  generateReleaseDates,
  generateReleaseDatesForYear
} from '../src/core/dateCalculator.js';

describe('Date Calculator', () => {
  describe('calculateThirdSaturday', () => {
    // Feature: scrum-ceremony-scheduler, Property 1: Third Saturday Calculation
    // Validates: Requirements 1.1
    it('should always return a Saturday that is the third occurrence in the month', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2020, max: 2050 }),
          fc.integer({ min: 1, max: 12 }),
          (year, month) => {
            const result = calculateThirdSaturday(year, month);
            
            // Property 1: Result must be a Saturday (day 6)
            const isSaturday = result.getDay() === 6;
            
            // Property 2: Result must be in the correct month and year
            const isCorrectMonth = result.getMonth() === month - 1;
            const isCorrectYear = result.getFullYear() === year;
            
            // Property 3: Result must be the third Saturday
            // Count Saturdays from start of month up to and including this date
            let saturdayCount = 0;
            for (let day = 1; day <= result.getDate(); day++) {
              const testDate = new Date(year, month - 1, day);
              if (testDate.getDay() === 6) {
                saturdayCount++;
              }
            }
            const isThirdSaturday = saturdayCount === 3;
            
            return isSaturday && isCorrectMonth && isCorrectYear && isThirdSaturday;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit test: Verify specific known dates
    it('should calculate January 2025 third Saturday as January 18', () => {
      const result = calculateThirdSaturday(2025, 1);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(18);
      expect(result.getDay()).toBe(6); // Saturday
    });
  });

  describe('getWorkingDays', () => {
    // Feature: scrum-ceremony-scheduler, Property 14: Daily Standup Working Days Only
    // Validates: Requirements 4.1, 4.2
    it('should only return working days (no weekends or holidays)', () => {
      fc.assert(
        fc.property(
          // Generate a start date
          fc.date({ min: new Date('2020-01-01'), max: new Date('2050-12-31') }),
          // Generate number of days to add (1-30 days range)
          fc.integer({ min: 1, max: 30 }),
          // Generate a list of holidays (0-5 holidays)
          fc.array(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2050-12-31') }),
            { minLength: 0, maxLength: 5 }
          ),
          (startDate, daysToAdd, holidays) => {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + daysToAdd);
            
            const workingDays = getWorkingDays(startDate, endDate, holidays);
            
            // Property 1: All returned dates must be working days
            const allAreWorkingDays = workingDays.every(day => {
              const dayOfWeek = day.getDay();
              // Not a weekend
              const notWeekend = dayOfWeek !== 0 && dayOfWeek !== 6;
              
              // Not a holiday
              const dayStr = day.toISOString().split('T')[0];
              const notHoliday = !holidays.some(holiday => {
                const holidayStr = holiday.toISOString().split('T')[0];
                return dayStr === holidayStr;
              });
              
              return notWeekend && notHoliday;
            });
            
            // Property 2: No weekends should be in the result
            const noWeekends = workingDays.every(day => {
              const dayOfWeek = day.getDay();
              return dayOfWeek !== 0 && dayOfWeek !== 6;
            });
            
            // Property 3: No holidays should be in the result
            const noHolidays = workingDays.every(day => {
              const dayStr = day.toISOString().split('T')[0];
              return !holidays.some(holiday => {
                const holidayStr = holiday.toISOString().split('T')[0];
                return dayStr === holidayStr;
              });
            });
            
            return allAreWorkingDays && noWeekends && noHolidays;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit test: Verify specific case
    it('should exclude weekends from a week range', () => {
      // Monday Jan 1, 2024 to Sunday Jan 7, 2024
      const start = new Date(2024, 0, 1); // Monday
      const end = new Date(2024, 0, 7);   // Sunday
      const workingDays = getWorkingDays(start, end, []);
      
      // Should have 5 working days (Mon-Fri)
      expect(workingDays.length).toBe(5);
      
      // All should be weekdays
      workingDays.forEach(day => {
        const dayOfWeek = day.getDay();
        expect(dayOfWeek).toBeGreaterThanOrEqual(1);
        expect(dayOfWeek).toBeLessThanOrEqual(5);
      });
    });

    it('should exclude holidays', () => {
      const start = new Date(2024, 0, 1); // Monday
      const end = new Date(2024, 0, 5);   // Friday
      const holiday = new Date(2024, 0, 3); // Wednesday is a holiday
      
      const workingDays = getWorkingDays(start, end, [holiday]);
      
      // Should have 4 working days (Mon, Tue, Thu, Fri)
      expect(workingDays.length).toBe(4);
      
      // Wednesday should not be in the list
      const hasWednesday = workingDays.some(day => day.getDate() === 3);
      expect(hasWednesday).toBe(false);
    });
  });

  describe('isWorkingDay', () => {
    it('should return false for weekends', () => {
      const saturday = new Date(2024, 0, 6); // Saturday
      const sunday = new Date(2024, 0, 7);   // Sunday
      
      expect(isWorkingDay(saturday, [])).toBe(false);
      expect(isWorkingDay(sunday, [])).toBe(false);
    });

    it('should return true for weekdays', () => {
      const monday = new Date(2024, 0, 1);
      expect(isWorkingDay(monday, [])).toBe(true);
    });

    it('should return false for holidays', () => {
      const date = new Date(2024, 0, 1);
      const holidays = [new Date(2024, 0, 1)];
      
      expect(isWorkingDay(date, holidays)).toBe(false);
    });
  });

  describe('addWorkingDays', () => {
    it('should add working days skipping weekends', () => {
      const friday = new Date(2024, 0, 5); // Friday
      const result = addWorkingDays(friday, 1, []);
      
      // Next working day should be Monday
      expect(result.getDay()).toBe(1); // Monday
      expect(result.getDate()).toBe(8);
    });

    it('should add working days skipping holidays', () => {
      const monday = new Date(2024, 0, 1);
      const tuesday = new Date(2024, 0, 2);
      const holidays = [tuesday];
      
      const result = addWorkingDays(monday, 1, holidays);
      
      // Should skip Tuesday (holiday) and land on Wednesday
      expect(result.getDate()).toBe(3);
    });
  });

  describe('generateReleaseDates', () => {
    // Feature: scrum-ceremony-scheduler, Property 2: Release Date Count Matches Request
    // Validates: Requirements 1.3
    it('should generate exactly as many release dates as months requested', () => {
      fc.assert(
        fc.property(
          // Generate an array of month/year pairs (1-12 months)
          fc.array(
            fc.record({
              year: fc.integer({ min: 2020, max: 2050 }),
              month: fc.integer({ min: 1, max: 12 })
            }),
            { minLength: 1, maxLength: 12 }
          ),
          (months) => {
            const releaseDates = generateReleaseDates(months);
            
            // Property: Number of release dates should equal number of months requested
            return releaseDates.length === months.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit test: Verify specific case
    it('should generate release dates for specific months', () => {
      const months = [
        { year: 2025, month: 1 },
        { year: 2025, month: 2 },
        { year: 2025, month: 3 }
      ];
      
      const releaseDates = generateReleaseDates(months);
      
      expect(releaseDates.length).toBe(3);
      expect(releaseDates[0].getMonth()).toBe(0); // January
      expect(releaseDates[1].getMonth()).toBe(1); // February
      expect(releaseDates[2].getMonth()).toBe(2); // March
    });
  });

  describe('generateReleaseDatesForYear', () => {
    // Feature: scrum-ceremony-scheduler, Property 4: Year Request Generates Twelve Dates
    // Validates: Requirements 1.5
    it('should always generate exactly 12 release dates for any year', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2020, max: 2050 }),
          (year) => {
            const releaseDates = generateReleaseDatesForYear(year);
            
            // Property 1: Should have exactly 12 dates
            const hasCorrectCount = releaseDates.length === 12;
            
            // Property 2: All dates should be in the requested year
            const allInCorrectYear = releaseDates.every(date => date.getFullYear() === year);
            
            // Property 3: Should have one date for each month (0-11)
            const months = releaseDates.map(date => date.getMonth());
            const hasAllMonths = months.length === 12 && 
              months.every((month, index) => month === index);
            
            return hasCorrectCount && allInCorrectYear && hasAllMonths;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit test: Verify specific year
    it('should generate 12 release dates for 2025', () => {
      const releaseDates = generateReleaseDatesForYear(2025);
      
      expect(releaseDates.length).toBe(12);
      
      // All should be in 2025
      releaseDates.forEach(date => {
        expect(date.getFullYear()).toBe(2025);
      });
      
      // Should have one for each month
      const months = releaseDates.map(date => date.getMonth());
      expect(months).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });
  });
});
