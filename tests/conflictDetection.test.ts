/**
 * Conflict Detection and Working Day Validation Tests
 * Property-based tests for conflict detection and working day validation
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateCeremoniesForSprint,
  rescheduleToNextWorkingDay,
  fallsOnHoliday,
  detectConflicts,
  proposeAlternativeTimes
} from '../src/services/ceremonyGenerator.js';
import { calculateThirdSaturday, isWorkingDay } from '../src/core/dateCalculator.js';
import { SprintConfig } from '../src/core/types.js';

// Helper to create a valid sprint config
function createSprintConfig(durationWeeks: number = 2): SprintConfig {
  return {
    durationWeeks,
    ceremonies: {
      sprintPlanning: {
        name: 'Sprint Planning',
        dayOffset: 0,
        timeOfDay: '09:00',
        durationMinutes: 120,
        attendeeType: 'team',
        description: 'Plan the sprint',
        agenda: []
      },
      dailyStandup: {
        name: 'Daily Standup',
        dayOffset: 0,
        timeOfDay: '09:30',
        durationMinutes: 15,
        attendeeType: 'team',
        description: 'Daily sync',
        agenda: []
      },
      sprintReview: {
        name: 'Sprint Review',
        dayOffset: -2,
        timeOfDay: '14:00',
        durationMinutes: 60,
        attendeeType: 'team-and-stakeholders',
        description: 'Review work',
        agenda: []
      },
      sprintRetrospective: {
        name: 'Sprint Retrospective',
        dayOffset: 0,
        timeOfDay: '15:30',
        durationMinutes: 90,
        attendeeType: 'team',
        description: 'Reflect',
        agenda: []
      }
    }
  };
}

describe('Working Day Validation', () => {
  // Feature: scrum-ceremony-scheduler, Property 24: Holidays Excluded from Scheduling
  // Validates: Requirements 8.1
  it('should not schedule ceremonies on holidays', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        fc.array(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2050-12-31') }),
          { minLength: 1, maxLength: 10 }
        ),
        (year, month, holidays) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, holidays);
          
          // Property: No ceremonies should be scheduled on holidays
          // (excluding Daily Standup which has recurrence rules with exclusions)
          const nonRecurringCeremonies = ceremonies.filter(c => c.type !== 'daily-standup');
          
          const noCeremoniesOnHolidays = nonRecurringCeremonies.every(ceremony => {
            return !fallsOnHoliday(ceremony, holidays);
          });
          
          return noCeremoniesOnHolidays;
        }
      ),
      { numRuns: 50 }
    );
  });

  // Feature: scrum-ceremony-scheduler, Property 25: Holiday Rescheduling to Next Working Day
  // Validates: Requirements 8.2
  it('should reschedule ceremonies that fall on holidays to next working day', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          // Create a ceremony
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          const ceremony = ceremonies[0]; // Sprint Planning
          
          // Create a holiday on the ceremony date
          const holidays = [new Date(ceremony.startDateTime)];
          
          // Reschedule the ceremony
          const rescheduled = rescheduleToNextWorkingDay(ceremony, holidays);
          
          // Property: Rescheduled ceremony should be on a working day
          const isOnWorkingDay = isWorkingDay(rescheduled.startDateTime, holidays);
          
          // Property: Rescheduled ceremony should be after the original date
          const isAfterOriginal = rescheduled.startDateTime > ceremony.startDateTime;
          
          return isOnWorkingDay && isAfterOriginal;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: scrum-ceremony-scheduler, Property 33: No Ceremonies on Non-Working Days
  // Validates: Requirements 10.1, 10.4
  it('should not schedule any ceremonies on non-working days after rescheduling', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        fc.array(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2050-12-31') }),
          { minLength: 0, maxLength: 5 }
        ),
        (year, month, holidays) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          let ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, holidays);
          
          // Reschedule any ceremonies that fall on non-working days
          ceremonies = ceremonies.map(ceremony => {
            if (ceremony.type === 'daily-standup') {
              return ceremony; // Daily standup handles this via recurrence rules
            }
            
            const dayOfWeek = ceremony.startDateTime.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = fallsOnHoliday(ceremony, holidays);
            
            if (isWeekend || isHoliday) {
              return rescheduleToNextWorkingDay(ceremony, holidays);
            }
            
            return ceremony;
          });
          
          // Property: After rescheduling, all non-recurring ceremonies should be on working days
          const nonRecurringCeremonies = ceremonies.filter(c => c.type !== 'daily-standup');
          
          const allOnWorkingDays = nonRecurringCeremonies.every(ceremony => {
            const dayOfWeek = ceremony.startDateTime.getDay();
            const notWeekend = dayOfWeek !== 0 && dayOfWeek !== 6;
            const notHoliday = !fallsOnHoliday(ceremony, holidays);
            
            return notWeekend && notHoliday;
          });
          
          return allOnWorkingDays;
        }
      ),
      { numRuns: 50 }
    );
  });

  // Feature: scrum-ceremony-scheduler, Property 34: Weekend Rescheduling to Working Day
  // Validates: Requirements 10.2
  it('should reschedule ceremonies that fall on weekends to next working day', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          // Generate ceremonies
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          
          // Find a ceremony and artificially move it to a weekend
          const ceremony = ceremonies[0]; // Sprint Planning
          const testDate = new Date(ceremony.startDateTime);
          
          // Move to next Saturday
          while (testDate.getDay() !== 6) {
            testDate.setDate(testDate.getDate() + 1);
          }
          
          const weekendCeremony = {
            ...ceremony,
            startDateTime: testDate,
            endDateTime: new Date(testDate.getTime() + ceremony.durationMinutes * 60 * 1000)
          };
          
          // Reschedule it
          const rescheduled = rescheduleToNextWorkingDay(weekendCeremony, []);
          
          // Property: Rescheduled ceremony should not be on a weekend
          const dayOfWeek = rescheduled.startDateTime.getDay();
          const notWeekend = dayOfWeek !== 0 && dayOfWeek !== 6;
          
          // Property: Should be after the original weekend date
          const isAfterOriginal = rescheduled.startDateTime > weekendCeremony.startDateTime;
          
          return notWeekend && isAfterOriginal;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Conflict Detection', () => {
  // Unit test: Verify basic conflict detection works
  it('should detect when ceremonies overlap', () => {
    const releaseDate = calculateThirdSaturday(2025, 1);
    const config = createSprintConfig();
    
    const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
    
    // Create an external event that overlaps with Sprint Planning
    const sprintPlanning = ceremonies.find(c => c.type === 'sprint-planning')!;
    const externalEvents = [{
      startDateTime: new Date(sprintPlanning.startDateTime.getTime() + 30 * 60 * 1000), // 30 min after start
      endDateTime: new Date(sprintPlanning.startDateTime.getTime() + 90 * 60 * 1000), // 90 min after start
      title: 'Company All-Hands'
    }];
    
    const conflicts = detectConflicts(ceremonies, externalEvents);
    
    // Should detect at least one conflict with external event
    const externalConflicts = conflicts.filter(c => c.conflictType === 'external-event');
    expect(externalConflicts.length).toBeGreaterThan(0);
  });
});


  // Feature: scrum-ceremony-scheduler, Property 26: Conflict Detection with Company Events
  // Validates: Requirements 8.3
  it('should detect conflicts with company events', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          
          // Create an external event that overlaps with a ceremony
          const targetCeremony = ceremonies[0]; // Sprint Planning
          const externalEvents = [{
            startDateTime: new Date(targetCeremony.startDateTime.getTime() + 15 * 60 * 1000), // 15 min after start
            endDateTime: new Date(targetCeremony.startDateTime.getTime() + 45 * 60 * 1000), // 45 min after start
            title: 'Company Meeting'
          }];
          
          const conflicts = detectConflicts(ceremonies, externalEvents);
          
          // Property: Should detect at least one conflict
          const hasConflict = conflicts.length > 0;
          
          // Property: The conflict should involve the target ceremony
          const involvesTargetCeremony = conflicts.some(c => c.ceremony.id === targetCeremony.id);
          
          return hasConflict && involvesTargetCeremony;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: scrum-ceremony-scheduler, Property 27: Conflict Report Completeness
  // Validates: Requirements 8.4
  it('should provide complete conflict reports with details of both events', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')), { minLength: 5, maxLength: 50 }),
        (year, month, eventTitle) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          
          // Create an external event that overlaps
          const targetCeremony = ceremonies[0];
          const externalEvents = [{
            startDateTime: new Date(targetCeremony.startDateTime.getTime() + 10 * 60 * 1000),
            endDateTime: new Date(targetCeremony.startDateTime.getTime() + 50 * 60 * 1000),
            title: eventTitle
          }];
          
          const conflicts = detectConflicts(ceremonies, externalEvents);
          
          // Filter to only external event conflicts
          const externalConflicts = conflicts.filter(c => c.conflictType === 'external-event');
          
          if (externalConflicts.length === 0) return true; // No external conflict to check
          
          const conflict = externalConflicts[0];
          
          // Property: Conflict report should have all required fields
          const hasConflictType = conflict.conflictType === 'external-event';
          const hasConflictDate = conflict.conflictDate instanceof Date;
          const hasDescription = typeof conflict.description === 'string' && conflict.description.length > 0;
          const hasCeremony = conflict.ceremony !== undefined;
          const descriptionMentionsEvent = conflict.description.includes(eventTitle);
          
          return hasConflictType && hasConflictDate && hasDescription && hasCeremony && descriptionMentionsEvent;
        }
      ),
      { numRuns: 100 }
    );
  });


describe('Automatic Conflict Resolution', () => {
  // Feature: scrum-ceremony-scheduler, Property 28: Alternative Times Proposed for Conflicts
  // Validates: Requirements 8.5
  it('should propose at least one alternative time for each conflict', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          
          // Create external events that conflict
          const targetCeremony = ceremonies[0];
          const externalEvents = [{
            startDateTime: new Date(targetCeremony.startDateTime.getTime() + 10 * 60 * 1000),
            endDateTime: new Date(targetCeremony.startDateTime.getTime() + 50 * 60 * 1000),
            title: 'Conflicting Event'
          }];
          
          const conflicts = detectConflicts(ceremonies, externalEvents);
          
          if (conflicts.length === 0) return true; // No conflicts to resolve
          
          // Propose alternatives
          const alternatives = proposeAlternativeTimes(conflicts, externalEvents);
          
          // Property: Should propose at least one alternative for each conflict
          const hasAlternativeForEachConflict = conflicts.every(conflict => 
            alternatives.has(conflict.ceremony.id)
          );
          
          // Property: Alternatives should be different from original times
          const alternativesAreDifferent = conflicts.every(conflict => {
            const alternative = alternatives.get(conflict.ceremony.id);
            return alternative && alternative.getTime() !== conflict.ceremony.startDateTime.getTime();
          });
          
          return hasAlternativeForEachConflict && alternativesAreDifferent;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should propose alternatives that do not conflict with external events', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForSprint(releaseDate, 1, config, []);
          
          // Create a single external event
          const targetCeremony = ceremonies[0];
          const externalEvents = [{
            startDateTime: new Date(targetCeremony.startDateTime.getTime() + 10 * 60 * 1000),
            endDateTime: new Date(targetCeremony.startDateTime.getTime() + 50 * 60 * 1000),
            title: 'Blocking Event'
          }];
          
          const conflicts = detectConflicts(ceremonies, externalEvents);
          
          if (conflicts.length === 0) return true;
          
          const alternatives = proposeAlternativeTimes(conflicts, externalEvents);
          
          // Property: Proposed alternatives should not overlap with external events
          const noNewConflicts = conflicts.every(conflict => {
            const alternative = alternatives.get(conflict.ceremony.id);
            if (!alternative) return false;
            
            const ceremonyDuration = conflict.ceremony.endDateTime.getTime() - conflict.ceremony.startDateTime.getTime();
            const alternativeEnd = new Date(alternative.getTime() + ceremonyDuration);
            
            // Check if alternative conflicts with any external event
            return !externalEvents.some(event => 
              alternative < event.endDateTime && event.startDateTime < alternativeEnd
            );
          });
          
          return noNewConflicts;
        }
      ),
      { numRuns: 100 }
    );
  });
});
