/**
 * Core type definitions for the Scrum Ceremony Scheduler
 */

/**
 * Represents a recurrence rule for recurring ceremonies (e.g., Daily Standup)
 */
export interface RecurrenceRule {
  frequency: 'daily' | 'weekly';
  until: Date;
  excludeDates: Date[];
  byDay?: string[]; // Days of week: MO, TU, WE, TH, FR, SA, SU
}

/**
 * Represents a calendar invite for a Scrum ceremony
 */
export interface CeremonyInvite {
  id: string;
  type: 'sprint-planning' | 'daily-standup' | 'sprint-review' | 'sprint-retrospective';
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  attendees: string[];
  location?: string;
  recurrence?: RecurrenceRule;
  sprintNumber: number;
  releaseDate: Date;
}

/**
 * Represents a conflict between a ceremony and another event
 */
export interface Conflict {
  ceremony: CeremonyInvite;
  conflictType: 'holiday' | 'overlap' | 'external-event';
  conflictDate: Date;
  description: string;
  suggestedAlternative?: Date;
}

/**
 * Represents a holiday or non-working day
 */
export interface Holiday {
  date: Date;
  name: string;
  country?: string;
}

/**
 * Configuration for a specific ceremony type
 */
export interface CeremonyConfig {
  name: string;
  dayOffset: number;        // Days relative to sprint start/end
  timeOfDay: string;        // HH:MM format
  durationMinutes: number;
  attendeeType: 'team' | 'team-and-stakeholders';
  description: string;
  agenda: string[];
}

/**
 * Configuration for sprint and all ceremonies
 */
export interface SprintConfig {
  durationWeeks: number;    // 2 or 3 weeks
  ceremonies: {
    sprintPlanning: CeremonyConfig;
    dailyStandup: CeremonyConfig;
    sprintReview: CeremonyConfig;
    sprintRetrospective: CeremonyConfig;
  };
}

/**
 * Template for ceremony invites with customizable fields
 */
export interface CeremonyTemplate {
  ceremonyType: 'sprint-planning' | 'daily-standup' | 'sprint-review' | 'sprint-retrospective';
  title: string;
  description: string;
  agenda: string[];
  variables: string[];  // List of supported variables like {{sprint_number}}
}

/**
 * Error response structure for consistent error handling
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}
