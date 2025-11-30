/**
 * Calendar Export Tests
 * Property-based and unit tests for iCalendar export
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  exportToICalendar,
  generateVEvent,
  generateCeremonySummary
} from '../src/services/calendarExport.js';
import { generateCeremoniesForMultipleSprints } from '../src/services/ceremonyGenerator.js';
import { calculateThirdSaturday, generateReleaseDatesForYear } from '../src/core/dateCalculator.js';
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

describe('iCalendar Export', () => {
  // Feature: scrum-ceremony-scheduler, Property 22: Valid iCalendar Format Output
  // Validates: Requirements 7.3
  it('should generate valid iCalendar format output', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 6 }), // 1-6 sprints
        (year, numSprints) => {
          const releaseDates = generateReleaseDatesForYear(year).slice(0, numSprints);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForMultipleSprints(releaseDates, config, []);
          const icalOutput = exportToICalendar(ceremonies);
          
          // Property: Output should start with BEGIN:VCALENDAR
          const startsCorrectly = icalOutput.startsWith('BEGIN:VCALENDAR');
          
          // Property: Output should end with END:VCALENDAR
          const endsCorrectly = icalOutput.trim().endsWith('END:VCALENDAR');
          
          // Property: Output should contain VERSION:2.0
          const hasVersion = icalOutput.includes('VERSION:2.0');
          
          // Property: Output should contain PRODID
          const hasProdId = icalOutput.includes('PRODID:');
          
          // Property: Output should have matching BEGIN/END VEVENT pairs
          const beginCount = (icalOutput.match(/BEGIN:VEVENT/g) || []).length;
          const endCount = (icalOutput.match(/END:VEVENT/g) || []).length;
          const matchingEvents = beginCount === endCount && beginCount === ceremonies.length;
          
          return startsCorrectly && endsCorrectly && hasVersion && hasProdId && matchingEvents;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include all required VEVENT fields', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 12 }),
        (year, month) => {
          const releaseDate = calculateThirdSaturday(year, month);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForMultipleSprints([releaseDate], config, []);
          const ceremony = ceremonies[0]; // Sprint Planning
          
          const vevent = generateVEvent(ceremony);
          
          // Property: VEVENT should contain required fields
          const hasUID = vevent.includes('UID:');
          const hasDTSTART = vevent.includes('DTSTART:');
          const hasDTEND = vevent.includes('DTEND:');
          const hasSUMMARY = vevent.includes('SUMMARY:');
          const hasDESCRIPTION = vevent.includes('DESCRIPTION:');
          const beginsCorrectly = vevent.startsWith('BEGIN:VEVENT');
          const endsCorrectly = vevent.trim().endsWith('END:VEVENT');
          
          return hasUID && hasDTSTART && hasDTEND && hasSUMMARY && hasDESCRIPTION && 
                 beginsCorrectly && endsCorrectly;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should properly format dates in iCalendar format', () => {
    const releaseDate = calculateThirdSaturday(2025, 1);
    const config = createSprintConfig();
    
    const ceremonies = generateCeremoniesForMultipleSprints([releaseDate], config, []);
    const icalOutput = exportToICalendar(ceremonies);
    
    // Property: Dates should be in YYYYMMDDTHHMMSS format
    const datePattern = /DTSTART:\d{8}T\d{6}/;
    expect(icalOutput).toMatch(datePattern);
  });
});

describe('Ceremony Summary', () => {
  // Feature: scrum-ceremony-scheduler, Property 23: Summary Contains All Ceremonies
  // Validates: Requirements 7.4
  it('should include all ceremonies in the summary', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        fc.integer({ min: 1, max: 6 }),
        (year, numSprints) => {
          const releaseDates = generateReleaseDatesForYear(year).slice(0, numSprints);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForMultipleSprints(releaseDates, config, []);
          const summary = generateCeremonySummary(ceremonies);
          
          // Property: Summary should mention each ceremony type
          const mentionsPlanning = ceremonies.some(c => c.type === 'sprint-planning') ? 
            summary.includes('Sprint Planning') : true;
          const mentionsStandup = ceremonies.some(c => c.type === 'daily-standup') ? 
            summary.includes('Daily Standup') : true;
          const mentionsReview = ceremonies.some(c => c.type === 'sprint-review') ? 
            summary.includes('Sprint Review') : true;
          const mentionsRetro = ceremonies.some(c => c.type === 'sprint-retrospective') ? 
            summary.includes('Sprint Retrospective') || summary.includes('Retrospective') : true;
          
          // Property: Summary should include total count
          const includesTotal = summary.includes('Total Ceremonies:') && 
                               summary.includes(ceremonies.length.toString());
          
          return mentionsPlanning && mentionsStandup && mentionsReview && mentionsRetro && includesTotal;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include dates and times for each ceremony', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2050 }),
        (year) => {
          const releaseDates = generateReleaseDatesForYear(year).slice(0, 2);
          const config = createSprintConfig();
          
          const ceremonies = generateCeremoniesForMultipleSprints(releaseDates, config, []);
          const summary = generateCeremonySummary(ceremonies);
          
          // Property: Summary should contain date information
          const hasDateInfo = summary.includes('Date:');
          
          // Property: Summary should contain duration information
          const hasDurationInfo = summary.includes('Duration:') && summary.includes('minutes');
          
          return hasDateInfo && hasDurationInfo;
        }
      ),
      { numRuns: 50 }
    );
  });
});
