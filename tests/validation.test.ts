/**
 * Validation Tests
 * Property-based and unit tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateSprintDuration, validateCeremonyConfig, validateTimeFormat } from '../src/utils/validation.js';
import { CeremonyConfig } from '../src/core/types.js';

describe('Validation', () => {
  describe('validateSprintDuration', () => {
    // Feature: scrum-ceremony-scheduler, Property 5: Sprint Duration Validation
    // Validates: Requirements 2.1
    it('should accept values of 2 or 3 and reject all other values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 100 }),
          (weeks) => {
            const result = validateSprintDuration(weeks);
            
            // Property: Values 2 or 3 should be valid (return null), all others invalid (return ErrorResponse)
            const isInValidRange = weeks === 2 || weeks === 3;
            const validationPassed = result === null;
            
            return isInValidRange === validationPassed;
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit tests for specific cases
    it('should accept valid sprint durations (2 or 3 weeks)', () => {
      expect(validateSprintDuration(2)).toBeNull();
      expect(validateSprintDuration(3)).toBeNull();
    });

    it('should reject sprint duration of 1 week', () => {
      const result = validateSprintDuration(1);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_SPRINT_DURATION');
      expect(result?.message).toContain('2 or 3');
    });

    it('should reject sprint duration of 4 weeks', () => {
      const result = validateSprintDuration(4);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_SPRINT_DURATION');
      expect(result?.message).toContain('2 or 3');
    });

    it('should reject sprint durations less than 1', () => {
      const result = validateSprintDuration(0);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_SPRINT_DURATION');
      expect(result?.message).toContain('2 or 3');
    });

    it('should reject sprint durations greater than 4', () => {
      const result = validateSprintDuration(5);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_SPRINT_DURATION');
      expect(result?.message).toContain('2 or 3');
    });

    it('should reject non-integer values', () => {
      const result = validateSprintDuration(2.5);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_SPRINT_DURATION');
      expect(result?.message).toContain('integer');
    });
  });

  describe('validateCeremonyConfig', () => {
    // Feature: scrum-ceremony-scheduler, Property 6: Ceremony Configuration Completeness
    // Validates: Requirements 2.2
    it('should ensure that day offset, time, and duration fields are all present and valid', () => {
      // Generator for valid time strings in HH:MM format
      const validTimeArb = fc.tuple(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 })
      ).map(([hours, minutes]) => 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      );

      // Generator for complete, valid ceremony configs
      const validConfigArb = fc.record({
        name: fc.string(),
        dayOffset: fc.integer({ min: -30, max: 30 }),
        timeOfDay: validTimeArb,
        durationMinutes: fc.integer({ min: 1, max: 480 }),
        attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
        description: fc.string(),
        agenda: fc.array(fc.string())
      });

      fc.assert(
        fc.property(validConfigArb, (config) => {
          const result = validateCeremonyConfig(config);
          // Property: All valid configs should pass validation (return null)
          return result === null;
        }),
        { numRuns: 100 }
      );
    });

    it('should reject configs with missing dayOffset', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            timeOfDay: fc.constant('09:00'),
            durationMinutes: fc.integer({ min: 1, max: 480 }),
            attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
            description: fc.string(),
            agenda: fc.array(fc.string())
          }),
          (config) => {
            const result = validateCeremonyConfig(config as any);
            // Property: Missing dayOffset should fail validation
            return result !== null && result.code === 'INVALID_CEREMONY_CONFIG';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configs with missing timeOfDay', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            dayOffset: fc.integer({ min: -30, max: 30 }),
            durationMinutes: fc.integer({ min: 1, max: 480 }),
            attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
            description: fc.string(),
            agenda: fc.array(fc.string())
          }),
          (config) => {
            const result = validateCeremonyConfig(config as any);
            // Property: Missing timeOfDay should fail validation
            return result !== null && result.code === 'INVALID_CEREMONY_CONFIG';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configs with missing durationMinutes', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            dayOffset: fc.integer({ min: -30, max: 30 }),
            timeOfDay: fc.constant('09:00'),
            attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
            description: fc.string(),
            agenda: fc.array(fc.string())
          }),
          (config) => {
            const result = validateCeremonyConfig(config as any);
            // Property: Missing durationMinutes should fail validation
            return result !== null && result.code === 'INVALID_CEREMONY_CONFIG';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configs with invalid time format', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            dayOffset: fc.integer({ min: -30, max: 30 }),
            timeOfDay: fc.string().filter(s => !validateTimeFormat(s)),
            durationMinutes: fc.integer({ min: 1, max: 480 }),
            attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
            description: fc.string(),
            agenda: fc.array(fc.string())
          }),
          (config) => {
            const result = validateCeremonyConfig(config);
            // Property: Invalid time format should fail validation
            return result !== null && result.code === 'INVALID_CEREMONY_CONFIG';
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject configs with non-positive durationMinutes', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            dayOffset: fc.integer({ min: -30, max: 30 }),
            timeOfDay: fc.constant('09:00'),
            durationMinutes: fc.integer({ max: 0 }),
            attendeeType: fc.constantFrom('team' as const, 'team-and-stakeholders' as const),
            description: fc.string(),
            agenda: fc.array(fc.string())
          }),
          (config) => {
            const result = validateCeremonyConfig(config);
            // Property: Non-positive duration should fail validation
            return result !== null && result.code === 'INVALID_CEREMONY_CONFIG';
          }
        ),
        { numRuns: 100 }
      );
    });

    // Unit tests for specific cases
    it('should accept a valid ceremony configuration', () => {
      const validConfig: CeremonyConfig = {
        name: 'Sprint Planning',
        dayOffset: 0,
        timeOfDay: '09:00',
        durationMinutes: 120,
        attendeeType: 'team',
        description: 'Plan the sprint',
        agenda: ['Review backlog', 'Estimate stories']
      };

      expect(validateCeremonyConfig(validConfig)).toBeNull();
    });

    it('should reject config with missing required fields', () => {
      const invalidConfig = {
        name: 'Sprint Planning',
        attendeeType: 'team',
        description: 'Plan the sprint',
        agenda: []
      } as any;

      const result = validateCeremonyConfig(invalidConfig);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CEREMONY_CONFIG');
      expect(result?.message).toContain('Missing required fields');
    });

    it('should reject config with invalid time format', () => {
      const invalidConfig: CeremonyConfig = {
        name: 'Sprint Planning',
        dayOffset: 0,
        timeOfDay: '25:00', // Invalid hour
        durationMinutes: 120,
        attendeeType: 'team',
        description: 'Plan the sprint',
        agenda: []
      };

      const result = validateCeremonyConfig(invalidConfig);
      expect(result).not.toBeNull();
      expect(result?.code).toBe('INVALID_CEREMONY_CONFIG');
      expect(result?.message).toContain('Invalid fields');
    });
  });
});
