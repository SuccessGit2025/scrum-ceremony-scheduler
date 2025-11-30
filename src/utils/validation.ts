/**
 * Validation utilities
 * Input validation and configuration validation functions
 */

import { SprintConfig, CeremonyConfig, ErrorResponse } from '../core/types.js';

/**
 * Validate sprint duration (2 or 3 weeks)
 * @param weeks Sprint duration in weeks
 * @returns ErrorResponse if invalid, null if valid
 */
export function validateSprintDuration(weeks: number): ErrorResponse | null {
  if (!Number.isInteger(weeks)) {
    return {
      code: 'INVALID_SPRINT_DURATION',
      message: 'Sprint duration must be an integer',
      details: { providedValue: weeks },
      suggestions: ['Provide a value of 2 or 3 weeks']
    };
  }

  if (weeks !== 2 && weeks !== 3) {
    return {
      code: 'INVALID_SPRINT_DURATION',
      message: `Sprint duration must be 2 or 3 weeks. Received: ${weeks}`,
      details: { providedValue: weeks, validValues: [2, 3] },
      suggestions: ['Use a sprint duration of 2 or 3 weeks']
    };
  }

  return null;
}

/**
 * Validate time format (HH:MM)
 * @param time Time string to validate
 * @returns true if valid, false otherwise
 */
export function validateTimeFormat(time: string): boolean {
  if (typeof time !== 'string') {
    return false;
  }

  // Match HH:MM format where HH is 00-23 and MM is 00-59
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(time);
}

/**
 * Validate ceremony configuration completeness
 * Validates that all required fields are present and valid
 * @param config Ceremony configuration to validate
 * @returns ErrorResponse if invalid, null if valid
 */
export function validateCeremonyConfig(config: CeremonyConfig): ErrorResponse | null {
  const missingFields: string[] = [];
  const invalidFields: { field: string; reason: string }[] = [];

  // Check for required fields
  if (config.dayOffset === undefined || config.dayOffset === null) {
    missingFields.push('dayOffset');
  } else if (!Number.isInteger(config.dayOffset)) {
    invalidFields.push({ field: 'dayOffset', reason: 'must be an integer' });
  }

  if (!config.timeOfDay) {
    missingFields.push('timeOfDay');
  } else if (!validateTimeFormat(config.timeOfDay)) {
    invalidFields.push({ 
      field: 'timeOfDay', 
      reason: 'must be in HH:MM format (e.g., 09:30, 14:00)' 
    });
  }

  if (config.durationMinutes === undefined || config.durationMinutes === null) {
    missingFields.push('durationMinutes');
  } else if (!Number.isInteger(config.durationMinutes)) {
    invalidFields.push({ field: 'durationMinutes', reason: 'must be an integer' });
  } else if (config.durationMinutes <= 0) {
    invalidFields.push({ field: 'durationMinutes', reason: 'must be a positive integer' });
  }

  // Return error if any validation failed
  if (missingFields.length > 0 || invalidFields.length > 0) {
    const errorParts: string[] = [];
    
    if (missingFields.length > 0) {
      errorParts.push(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    if (invalidFields.length > 0) {
      const invalidDescriptions = invalidFields.map(
        ({ field, reason }) => `${field} ${reason}`
      );
      errorParts.push(`Invalid fields: ${invalidDescriptions.join('; ')}`);
    }

    return {
      code: 'INVALID_CEREMONY_CONFIG',
      message: errorParts.join('. '),
      details: {
        missingFields: missingFields.length > 0 ? missingFields : undefined,
        invalidFields: invalidFields.length > 0 ? invalidFields : undefined
      },
      suggestions: [
        'Ensure dayOffset is an integer',
        'Ensure timeOfDay is in HH:MM format (e.g., 09:30)',
        'Ensure durationMinutes is a positive integer'
      ]
    };
  }

  return null;
}
