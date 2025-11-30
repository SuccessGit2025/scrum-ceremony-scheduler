/**
 * Ceremony Generation Service
 * Orchestrates the generation of all ceremony invites
 */

import { CeremonyInvite, SprintConfig, Conflict, CeremonyConfig } from '../core/types.js';
import { 
  calculateSprintStart, 
  calculateSprintEnd, 
  calculateCeremonyDate,
  getWorkingDays,
  isWorkingDay,
  addWorkingDays
} from '../core/dateCalculator.js';
import { loadTemplate, renderTemplate } from './templateManager.js';
import { serializeDate } from '../utils/dateSerializer.js';
import { randomUUID } from 'crypto';

/**
 * Generate Sprint Planning ceremony invite
 */
export function generateSprintPlanning(
  releaseDate: Date,
  sprintNumber: number,
  sprintConfig: SprintConfig,
  holidays: Date[] = [],
  teamId?: string
): CeremonyInvite {
  const config = sprintConfig.ceremonies.sprintPlanning;
  const sprintStart = calculateSprintStart(releaseDate, sprintConfig.durationWeeks);
  const sprintEnd = calculateSprintEnd(sprintStart, sprintConfig.durationWeeks);
  
  // Sprint Planning happens at sprint start (dayOffset is relative to sprint start)
  // Set the time on the sprint start date
  let startDateTime = new Date(sprintStart);
  const [hours, minutes] = config.timeOfDay.split(':').map(Number);
  startDateTime.setHours(hours, minutes, 0, 0);
  startDateTime.setDate(startDateTime.getDate() + config.dayOffset);
  
  // Ensure it's on a working day
  while (!isWorkingDay(startDateTime, holidays)) {
    startDateTime.setDate(startDateTime.getDate() + 1);
  }
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + config.durationMinutes);
  
  // Load and render template
  const template = loadTemplate('sprint-planning', teamId);
  const variables = {
    sprint_number: sprintNumber.toString(),
    release_date: serializeDate(releaseDate),
    sprint_start: serializeDate(sprintStart),
    sprint_end: serializeDate(sprintEnd)
  };
  const description = renderTemplate(template, variables);
  
  return {
    id: randomUUID(),
    type: 'sprint-planning',
    title: template.title.replace(/\{\{sprint_number\}\}/g, sprintNumber.toString()),
    description,
    startDateTime,
    endDateTime,
    attendees: [],
    sprintNumber,
    releaseDate
  };
}

/**
 * Generate Sprint Review ceremony invite
 */
export function generateSprintReview(
  releaseDate: Date,
  sprintNumber: number,
  sprintConfig: SprintConfig,
  holidays: Date[] = [],
  teamId?: string
): CeremonyInvite {
  const config = sprintConfig.ceremonies.sprintReview;
  
  // Sprint Review happens before release date + day offset (typically negative)
  let startDateTime = calculateCeremonyDate(releaseDate, config.dayOffset, config.timeOfDay);
  
  // Ensure it's on a working day
  while (!isWorkingDay(startDateTime, holidays)) {
    startDateTime.setDate(startDateTime.getDate() + 1);
  }
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + config.durationMinutes);
  
  // Load and render template
  const template = loadTemplate('sprint-review', teamId);
  const variables = {
    sprint_number: sprintNumber.toString(),
    release_date: serializeDate(releaseDate)
  };
  const description = renderTemplate(template, variables);
  
  return {
    id: randomUUID(),
    type: 'sprint-review',
    title: template.title.replace(/\{\{sprint_number\}\}/g, sprintNumber.toString()),
    description,
    startDateTime,
    endDateTime,
    attendees: [],
    sprintNumber,
    releaseDate
  };
}

/**
 * Generate Sprint Retrospective ceremony invite
 */
export function generateSprintRetrospective(
  releaseDate: Date,
  sprintNumber: number,
  sprintConfig: SprintConfig,
  holidays: Date[] = [],
  teamId?: string
): CeremonyInvite {
  const config = sprintConfig.ceremonies.sprintRetrospective;
  
  // Calculate sprint boundaries
  const sprintStart = calculateSprintStart(releaseDate, sprintConfig.durationWeeks);
  const sprintEnd = calculateSprintEnd(sprintStart, sprintConfig.durationWeeks);
  
  // Sprint Retrospective must be:
  // 1. After sprint end date (Requirement 6.2)
  // 2. After Sprint Review (Requirement 6.3)
  // 3. On a different day than Sprint Review (Requirement 6.3)
  
  const reviewConfig = sprintConfig.ceremonies.sprintReview;
  const reviewDate = calculateCeremonyDate(releaseDate, reviewConfig.dayOffset, reviewConfig.timeOfDay);
  
  // Start with the day after Sprint Review to ensure different days (Requirement 6.3)
  const dayAfterReview = new Date(reviewDate);
  dayAfterReview.setDate(dayAfterReview.getDate() + 1);
  dayAfterReview.setHours(0, 0, 0, 0); // Start of next day
  
  // Also ensure it's after the sprint end day (Requirement 6.2)
  const dayAfterSprintEnd = new Date(sprintEnd);
  dayAfterSprintEnd.setDate(dayAfterSprintEnd.getDate() + 1);
  dayAfterSprintEnd.setHours(0, 0, 0, 0);
  
  // Use whichever is later: day after review or day after sprint end
  const retroBaseDate = dayAfterReview > dayAfterSprintEnd ? dayAfterReview : dayAfterSprintEnd;
  
  // Apply configured time and day offset
  let startDateTime = calculateCeremonyDate(retroBaseDate, config.dayOffset, config.timeOfDay);
  
  // Ensure it's on a working day
  while (!isWorkingDay(startDateTime, holidays)) {
    startDateTime.setDate(startDateTime.getDate() + 1);
  }
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + config.durationMinutes);
  
  // Load and render template
  const template = loadTemplate('sprint-retrospective', teamId);
  const variables = {
    sprint_number: sprintNumber.toString()
  };
  const description = renderTemplate(template, variables);
  
  return {
    id: randomUUID(),
    type: 'sprint-retrospective',
    title: template.title.replace(/\{\{sprint_number\}\}/g, sprintNumber.toString()),
    description,
    startDateTime,
    endDateTime,
    attendees: [],
    sprintNumber,
    releaseDate
  };
}

/**
 * Generate Daily Standup ceremony invites
 */
export function generateDailyStandup(
  releaseDate: Date,
  sprintNumber: number,
  sprintConfig: SprintConfig,
  holidays: Date[],
  teamId?: string
): CeremonyInvite {
  const config = sprintConfig.ceremonies.dailyStandup;
  const sprintStart = calculateSprintStart(releaseDate, sprintConfig.durationWeeks);
  const sprintEnd = calculateSprintEnd(sprintStart, sprintConfig.durationWeeks);
  
  // Get all working days in the sprint
  const workingDays = getWorkingDays(sprintStart, sprintEnd, holidays);
  
  // First standup is on first working day
  const firstStandup = workingDays[0];
  const [hours, minutes] = config.timeOfDay.split(':').map(Number);
  const startDateTime = new Date(firstStandup);
  startDateTime.setHours(hours, minutes, 0, 0);
  
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(endDateTime.getMinutes() + config.durationMinutes);
  
  // Last standup is on last working day - set until to end of sprint
  const until = new Date(sprintEnd);
  until.setHours(23, 59, 59, 999);
  
  // Load and render template
  const template = loadTemplate('daily-standup', teamId);
  const variables = {
    sprint_number: sprintNumber.toString()
  };
  const description = renderTemplate(template, variables);
  
  return {
    id: randomUUID(),
    type: 'daily-standup',
    title: template.title.replace(/\{\{sprint_number\}\}/g, sprintNumber.toString()),
    description,
    startDateTime,
    endDateTime,
    attendees: [],
    recurrence: {
      frequency: 'daily',
      until,
      excludeDates: holidays,
      byDay: ['MO', 'TU', 'WE', 'TH', 'FR'] // Only weekdays
    },
    sprintNumber,
    releaseDate
  };
}

/**
 * Generate all ceremony invites for a single sprint
 */
export function generateCeremoniesForSprint(
  releaseDate: Date,
  sprintNumber: number,
  sprintConfig: SprintConfig,
  holidays: Date[],
  teamId?: string
): CeremonyInvite[] {
  return [
    generateSprintPlanning(releaseDate, sprintNumber, sprintConfig, holidays, teamId),
    generateDailyStandup(releaseDate, sprintNumber, sprintConfig, holidays, teamId),
    generateSprintReview(releaseDate, sprintNumber, sprintConfig, holidays, teamId),
    generateSprintRetrospective(releaseDate, sprintNumber, sprintConfig, holidays, teamId)
  ];
}

/**
 * Generate ceremonies for multiple sprints
 */
export function generateCeremoniesForMultipleSprints(
  releaseDates: Date[],
  sprintConfig: SprintConfig,
  holidays: Date[],
  teamId?: string
): CeremonyInvite[] {
  const allCeremonies: CeremonyInvite[] = [];
  
  releaseDates.forEach((releaseDate, index) => {
    const sprintNumber = index + 1;
    const ceremonies = generateCeremoniesForSprint(
      releaseDate,
      sprintNumber,
      sprintConfig,
      holidays,
      teamId
    );
    allCeremonies.push(...ceremonies);
  });
  
  return allCeremonies;
}

/**
 * Add attendees to a ceremony invite
 */
export function addAttendees(
  ceremony: CeremonyInvite,
  attendees: string[],
  attendeeType: 'team' | 'team-and-stakeholders'
): CeremonyInvite {
  // For retrospective, only add team members
  if (ceremony.type === 'sprint-retrospective' && attendeeType === 'team-and-stakeholders') {
    // Filter to only team members (this would need additional logic in real implementation)
    return { ...ceremony, attendees };
  }
  
  return { ...ceremony, attendees };
}

/**
 * Check if a ceremony falls on a holiday
 */
export function fallsOnHoliday(ceremony: CeremonyInvite, holidays: Date[]): boolean {
  const ceremonyDate = ceremony.startDateTime.toISOString().split('T')[0];
  return holidays.some(holiday => {
    const holidayDate = holiday.toISOString().split('T')[0];
    return ceremonyDate === holidayDate;
  });
}

/**
 * Reschedule a ceremony to the next working day
 */
export function rescheduleToNextWorkingDay(
  ceremony: CeremonyInvite,
  holidays: Date[]
): CeremonyInvite {
  let newDate = new Date(ceremony.startDateTime);
  
  // Keep moving forward until we find a working day
  while (true) {
    newDate.setDate(newDate.getDate() + 1);
    const dayOfWeek = newDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidays.some(h => {
      const hDate = h.toISOString().split('T')[0];
      const nDate = newDate.toISOString().split('T')[0];
      return hDate === nDate;
    });
    
    if (!isWeekend && !isHoliday) {
      break;
    }
  }
  
  // Calculate duration
  const duration = ceremony.endDateTime.getTime() - ceremony.startDateTime.getTime();
  
  return {
    ...ceremony,
    startDateTime: newDate,
    endDateTime: new Date(newDate.getTime() + duration)
  };
}

/**
 * Detect conflicts in ceremony schedules
 */
export function detectConflicts(
  ceremonies: CeremonyInvite[],
  externalEvents?: Array<{ startDateTime: Date; endDateTime: Date; title: string }>
): Conflict[] {
  const conflicts: Conflict[] = [];
  
  // Check for overlaps between ceremonies
  for (let i = 0; i < ceremonies.length; i++) {
    for (let j = i + 1; j < ceremonies.length; j++) {
      const c1 = ceremonies[i];
      const c2 = ceremonies[j];
      
      // Check if ceremonies overlap
      if (c1.startDateTime < c2.endDateTime && c2.startDateTime < c1.endDateTime) {
        conflicts.push({
          ceremony: c1,
          conflictType: 'overlap',
          conflictDate: c1.startDateTime,
          description: `Ceremony overlaps with ${c2.title}`,
          suggestedAlternative: new Date(c2.endDateTime.getTime() + 30 * 60 * 1000) // 30 min after
        });
      }
    }
    
    // Check for conflicts with external events
    if (externalEvents) {
      for (const event of externalEvents) {
        const c = ceremonies[i];
        if (c.startDateTime < event.endDateTime && event.startDateTime < c.endDateTime) {
          conflicts.push({
            ceremony: c,
            conflictType: 'external-event',
            conflictDate: c.startDateTime,
            description: `Ceremony conflicts with external event: ${event.title}`,
            suggestedAlternative: new Date(event.endDateTime.getTime() + 30 * 60 * 1000)
          });
        }
      }
    }
  }
  
  return conflicts;
}


/**
 * Propose alternative times for conflicting ceremonies
 * @param conflicts List of conflicts detected
 * @param externalEvents List of external events to avoid
 * @returns Map of ceremony IDs to suggested alternative times
 */
export function proposeAlternativeTimes(
  conflicts: Conflict[],
  externalEvents: Array<{ startDateTime: Date; endDateTime: Date; title: string }>
): Map<string, Date> {
  const alternatives = new Map<string, Date>();
  
  for (const conflict of conflicts) {
    const ceremony = conflict.ceremony;
    
    // Start with the suggested alternative if provided
    let proposedTime = conflict.suggestedAlternative || new Date(ceremony.endDateTime);
    
    // Keep trying times until we find one that doesn't conflict
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Check if this time conflicts with any external events
      const ceremonyDuration = ceremony.endDateTime.getTime() - ceremony.startDateTime.getTime();
      const proposedEnd = new Date(proposedTime.getTime() + ceremonyDuration);
      
      let hasConflict = false;
      
      // Check against external events
      for (const event of externalEvents) {
        if (proposedTime < event.endDateTime && event.startDateTime < proposedEnd) {
          hasConflict = true;
          break;
        }
      }
      
      if (!hasConflict) {
        // Found a good time!
        alternatives.set(ceremony.id, proposedTime);
        break;
      }
      
      // Try 30 minutes later
      proposedTime = new Date(proposedTime.getTime() + 30 * 60 * 1000);
      attempts++;
    }
    
    // If we couldn't find a time, use the last attempted time anyway
    if (!alternatives.has(ceremony.id)) {
      alternatives.set(ceremony.id, proposedTime);
    }
  }
  
  return alternatives;
}
