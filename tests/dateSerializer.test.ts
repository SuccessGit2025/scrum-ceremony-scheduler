/**
 * Date Serializer Tests
 * Property-based and unit tests for ISO 8601 date serialization
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { serializeDate, parseDate } from '../src/utils/dateSerializer.js';

describe('Date Serializer', () => {
  describe('serializeDate', () => {
    it('should serialize dates to ISO 8601 format (YYYY-MM-DD)', () => {
      const date = new Date(2025, 0, 18); // January 18, 2025
      const result = serializeDate(date);
      expect(result).toBe('2025-01-18');
    });

    it('should pad single-digit months and days with zeros', () => {
      const date = new Date(2025, 0, 5); // January 5, 2025
      const result = serializeDate(date);
      expect(result).toBe('2025-01-05');
    });
  });

  describe('parseDate', () => {
    it('should parse valid ISO 8601 date strings', () => {
      const result = parseDate('2025-01-18');
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(18);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseDate('2025/01/18')).toThrow('Invalid ISO 8601 date format');
      expect(() => parseDate('01-18-2025')).toThrow('Invalid ISO 8601 date format');
      expect(() => parseDate('2025-1-18')).toThrow('Invalid ISO 8601 date format');
    });

    it('should throw error for invalid month', () => {
      expect(() => parseDate('2025-13-18')).toThrow('Invalid month');
      expect(() => parseDate('2025-00-18')).toThrow('Invalid month');
    });

    it('should throw error for invalid day', () => {
      expect(() => parseDate('2025-01-32')).toThrow('Invalid day');
      expect(() => parseDate('2025-01-00')).toThrow('Invalid day');
    });

    it('should throw error for invalid dates like Feb 31', () => {
      expect(() => parseDate('2025-02-31')).toThrow('Invalid date');
    });
  });

  describe('Round Trip Property', () => {
    // Feature: scrum-ceremony-scheduler, Property 3: Date Serialization Round Trip
    // Validates: Requirements 1.4
    it('should preserve date through serialize-parse round trip', () => {
      fc.assert(
        fc.property(
          // Generate dates with year, month, and day
          fc.integer({ min: 2020, max: 2050 }),
          fc.integer({ min: 1, max: 12 }),
          fc.integer({ min: 1, max: 28 }), // Use 1-28 to avoid invalid dates like Feb 31
          (year, month, day) => {
            // Create original date
            const originalDate = new Date(year, month - 1, day);
            
            // Serialize to ISO 8601
            const serialized = serializeDate(originalDate);
            
            // Parse back to Date
            const parsedDate = parseDate(serialized);
            
            // Property: Round trip should preserve year, month, and day
            const yearMatches = parsedDate.getFullYear() === originalDate.getFullYear();
            const monthMatches = parsedDate.getMonth() === originalDate.getMonth();
            const dayMatches = parsedDate.getDate() === originalDate.getDate();
            
            return yearMatches && monthMatches && dayMatches;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
