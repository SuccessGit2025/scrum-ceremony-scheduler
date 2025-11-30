# Implementation Plan

- [x] 1. Set up project structure and core types
  - Create TypeScript project with necessary dependencies (fast-check for property testing)
  - Define core TypeScript interfaces: CeremonyInvite, RecurrenceRule, Conflict, Holiday, CeremonyConfig, SprintConfig
  - Set up testing framework (Jest or Vitest) with fast-check integration
  - Create directory structure: src/core, src/services, src/cli, src/utils, tests/
  - _Requirements: All requirements - foundational setup_

- [x] 2. Implement Date Calculator module
  - [x] 2.1 Implement third Saturday calculation function
    - Write calculateThirdSaturday(year, month) function
    - Handle edge cases for month/year boundaries
    - _Requirements: 1.1_

  - [x] 2.2 Write property test for third Saturday calculation
    - **Property 1: Third Saturday Calculation**
    - **Validates: Requirements 1.1**

  - [x] 2.3 Implement working days calculation
    - Write getWorkingDays(startDate, endDate, holidays) function
    - Write isWorkingDay(date, holidays) helper function
    - Write addWorkingDays(date, days, holidays) function
    - _Requirements: 4.2, 8.1_

  - [x] 2.4 Write property test for working days exclusion
    - **Property 14: Daily Standup Working Days Only**
    - **Validates: Requirements 4.1, 4.2**

  - [x] 2.5 Implement release date generation for multiple months
    - Write function to generate release dates for list of months
    - Write function to generate all 12 release dates for a year
    - _Requirements: 1.3, 1.5_

  - [x] 2.6 Write property tests for release date generation
    - **Property 2: Release Date Count Matches Request**
    - **Validates: Requirements 1.3**
    - **Property 4: Year Request Generates Twelve Dates**
    - **Validates: Requirements 1.5**

- [x] 3. Implement date serialization and validation
  - [x] 3.1 Implement ISO 8601 date serialization
    - Write functions to serialize dates to ISO 8601 format
    - Write functions to parse ISO 8601 dates
    - _Requirements: 1.4_

  - [x] 3.2 Write property test for date serialization round trip
    - **Property 3: Date Serialization Round Trip**
    - **Validates: Requirements 1.4**

- [x] 4. Implement configuration validation
  - [x] 4.1 Implement sprint duration validator
    - Write validation function for sprint duration (1-4 weeks)
    - Return appropriate error messages for invalid values
    - _Requirements: 2.1_

  - [x] 4.2 Write property test for sprint duration validation
    - **Property 5: Sprint Duration Validation**
    - **Validates: Requirements 2.1**

  - [x] 4.3 Implement ceremony configuration validator
    - Write validation for required fields (dayOffset, time, duration)
    - Validate time format (HH:MM)
    - Validate duration is positive integer
    - _Requirements: 2.2_

  - [x] 4.4 Write property test for ceremony configuration completeness
    - **Property 6: Ceremony Configuration Completeness**
    - **Validates: Requirements 2.2**

- [x] 5. Implement Template Manager - Storage
  - [x] 5.1 Create template data structures and storage
    - Define CeremonyTemplate interface
    - Implement template storage (file-based JSON)
    - Implement loadTemplate and saveTemplate functions
    - _Requirements: 9.1_

  - [x] 5.2 Write property test for template storage round trip
    - **Property 29: Template Storage Round Trip**
    - **Validates: Requirements 9.1**

- [x] 5a. Implement Template Manager - Rendering and Team Support
  - [x] 5a.1 Implement template variable replacement
    - Write renderTemplate function with variable substitution
    - Support variables: {{sprint_number}}, {{release_date}}, {{sprint_start}}, {{sprint_end}}
    - _Requirements: 9.3_

  - [x] 5a.2 Write property test for template variable replacement
    - **Property 31: Template Variable Replacement**
    - **Validates: Requirements 9.3**

  - [x] 5a.3 Implement team-specific template support
    - Add team ID parameter to template functions
    - Store templates in team-specific directories
    - _Requirements: 9.5_

  - [x] 5a.4 Write property test for team-specific template isolation
    - **Property 32: Team-Specific Template Isolation**
    - **Validates: Requirements 9.5**

  - [x] 5a.5 Create default ceremony templates
    - Create default templates for all four ceremony types
    - Include standard agendas and descriptions
    - _Requirements: 3.4, 5.4, 6.4_

- [x] 6. Implement sprint date calculation helpers
  - [x] 6.1 Implement sprint boundary calculation
    - Write function to calculate sprint start date from release date
    - Write function to calculate sprint end date from start date and duration
    - Handle working days and sprint duration in weeks
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 7. Implement Ceremony Generation Service - Core Logic
  - [x] 7.1 Implement Sprint Planning generation
    - Write function to generate Sprint Planning invite
    - Calculate date as sprint start date
    - Apply configuration for time and duration
    - Populate from template with variables
    - _Requirements: 2.3, 3.1, 3.3, 3.4_

  - [x] 7.2 Write property tests for Sprint Planning
    - **Property 7: Sprint Planning at Sprint Start**
    - **Validates: Requirements 2.3**
    - **Property 10: Ceremony Invite Completeness** (Sprint Planning)
    - **Validates: Requirements 3.1**
    - **Property 11: Configuration Duration Applied** (Sprint Planning)
    - **Validates: Requirements 3.3**
    - **Property 12: Agenda Included in Sprint Planning**
    - **Validates: Requirements 3.4**

  - [x] 7.3 Implement Sprint Review generation
    - Write function to generate Sprint Review invite
    - Calculate date before release date based on configuration
    - Apply configuration for time and duration
    - Populate from template with variables
    - _Requirements: 2.4, 5.1, 5.3, 5.4_

  - [x] 7.4 Write property tests for Sprint Review
    - **Property 8: Sprint Review Before Release**
    - **Validates: Requirements 2.4**
    - **Property 10: Ceremony Invite Completeness** (Sprint Review)
    - **Validates: Requirements 5.1**
    - **Property 11: Configuration Duration Applied** (Sprint Review)
    - **Validates: Requirements 5.3**
    - **Property 17: Demonstration Guidelines in Sprint Review**
    - **Validates: Requirements 5.4**

  - [x] 7.5 Implement Sprint Retrospective generation
    - Write function to generate Sprint Retrospective invite
    - Calculate date after Sprint Review and before next sprint
    - Apply configuration for time and duration
    - Populate from template with variables
    - _Requirements: 2.5, 6.1, 6.3, 6.4_

  - [x] 7.6 Write property tests for Sprint Retrospective




    - **Property 9: Sprint Retrospective Ordering**
    - **Validates: Requirements 2.5**
    - **Property 10: Ceremony Invite Completeness** (Sprint Retrospective)
    - **Validates: Requirements 6.1**
    - **Property 11: Configuration Duration Applied** (Sprint Retrospective)
    - **Validates: Requirements 6.3**
    - **Property 19: Retrospective Format Guidelines Included**
    - **Validates: Requirements 6.4**
    - **Property 35: Sprint Retrospective Default Duration**
    - **Validates: Requirements 6.4**
    - **Property 36: Sprint Review and Retrospective on Different Days**
    - **Validates: Requirements 6.2**
    - **Property 37: Sprint Retrospective After Sprint End**
    - **Validates: Requirements 6.2**

  - [x] 7.7 Implement Daily Standup generation
    - Write function to generate Daily Standup recurring invite
    - Calculate all working days in sprint
    - Create recurrence rule with exclusions for holidays
    - Apply consistent time across all occurrences
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [x] 7.8 Write property tests for Daily Standup
    - **Property 15: Daily Standup Consistent Time**
    - **Validates: Requirements 4.3**
    - **Property 16: Daily Standup Ends With Sprint**
    - **Validates: Requirements 4.5**

- [x] 8. Implement attendee management
  - [x] 8.1 Implement attendee list handling
    - Write function to add attendees to ceremony invites
    - Support different attendee types (team, stakeholders)
    - _Requirements: 3.5, 5.5, 6.5_

  - [x] 8.2 Write property tests for attendee management
    - **Property 13: Attendee List Preservation**
    - **Validates: Requirements 3.5, 5.5**
    - **Property 18: Team-Only Attendees for Retrospective**
    - **Validates: Requirements 6.5**

- [x] 9. Implement multi-sprint ceremony generation
  - [x] 9.1 Implement batch ceremony generation
    - Write generateCeremoniesForMultipleSprints function
    - Generate all four ceremony types for each sprint
    - Ensure ceremonies don't overlap between sprints
    - _Requirements: 7.1, 7.2_

  - [x] 9.2 Write property tests for multi-sprint generation
    - **Property 20: All Ceremony Types Generated Per Sprint**
    - **Validates: Requirements 7.1**
    - **Property 21: No Ceremony Overlap Between Sprints**
    - **Validates: Requirements 7.2**

- [ ] 11. Implement conflict detection and resolution
  - [x] 11.1 Implement working day validation and rescheduling
    - Write function to validate ceremony dates are on working days
    - Implement rescheduling for weekends to next working day
    - Implement rescheduling for holidays to next working day


    - _Requirements: 8.1, 8.2, 10.1, 10.2, 10.3_

  - [ ] 11.2 Write property tests for working day validation
    - **Property 24: Holidays Excluded from Scheduling**
    - **Validates: Requirements 8.1**
    - **Property 25: Holiday Rescheduling to Next Working Day**
    - **Validates: Requirements 8.2**
    - **Property 33: No Ceremonies on Non-Working Days**
    - **Validates: Requirements 10.1, 10.4**
    - **Property 34: Weekend Rescheduling to Working Day**
    - **Validates: Requirements 10.2**

  - [x] 11.3 Implement company event conflict detection

    - Write detectConflicts function for external events
    - Generate conflict reports with details
    - _Requirements: 8.3, 8.4_

  - [x] 11.4 Write property tests for conflict detection


    - **Property 26: Conflict Detection with Company Events**
    - **Validates: Requirements 8.3**
    - **Property 27: Conflict Report Completeness**

    - **Validates: Requirements 8.4**

  - [ ] 11.5 Implement automatic conflict resolution
    - Write function to propose alternative times
    - Ensure alternatives don't create new conflicts
    - _Requirements: 8.5_

  - [ ] 11.6 Write property test for alternative time proposals
    - **Property 28: Alternative Times Proposed for Conflicts**
    - **Validates: Requirements 8.5**



- [x] 12. Implement Calendar Export Service
  - [x] 12.1 Implement iCalendar format generation
    - Write generateVEvent function for individual ceremonies
    - Write exportToICalendar function for ceremony lists
    - Implement VEVENT, VTIMEZONE, and RRULE components
    - Follow RFC 5545 specification
    - _Requirements: 7.3_

  - [ ] 12.2 Write property test for iCalendar format validity
    - **Property 22: Valid iCalendar Format Output**
    - **Validates: Requirements 7.3**



  - [x] 12.3 Implement file export functionality
    - Write writeICalendarFile function
    - Handle file permissions and errors
    - _Requirements: 7.3_

  - [x] 12.4 Implement ceremony summary generation
    - Write function to generate human-readable summary
    - Include all ceremonies with dates and times
    - _Requirements: 7.4_

  - [ ] 12.5 Write property test for summary completeness
    - **Property 23: Summary Contains All Ceremonies**
    - **Validates: Requirements 7.4**

- [x] 13. Implement CLI Interface
  - [x] 13.1 Set up CLI framework
    - Choose CLI library (commander.js or yargs)
    - Define command structure and options
    - Implement help text and usage examples
    - _Requirements: All requirements - user interface_

  - [x] 13.2 Implement 'generate' command
    - Parse year and sprint count options
    - Load configuration
    - Generate ceremonies
    - Export to file
    - Display summary
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ] 13.3 Implement 'configure' command
    - Interactive prompts for sprint duration
    - Interactive prompts for ceremony timings
    - Save configuration to file
    - _Requirements: 2.1, 2.2_

  - [ ] 13.4 Implement 'template' command
    - Subcommands: edit, list, reset
    - Load and save templates
    - Support team-specific templates
    - _Requirements: 9.1, 9.2, 9.5_

  - [ ] 13.5 Implement 'validate' command
    - Load and validate configuration file
    - Report validation errors with suggestions
    - _Requirements: 2.1, 2.2_

  - [ ]* 13.6 Write integration tests for CLI commands
    - Test generate command end-to-end
    - Test configure command with file I/O
    - Test template command operations
    - Test validate command with various configs

- [ ] 14. Implement error handling
  - [ ] 14.1 Add error handling to ceremony generation
    - Add try-catch blocks and error propagation
    - Validate inputs at module boundaries
    - Return ErrorResponse objects consistently
    - _Requirements: All requirements - error handling_

  - [ ]* 14.2 Write unit tests for error conditions
    - Test invalid sprint duration errors
    - Test invalid date format errors
    - Test missing configuration errors
    - Test file permission errors

- [x] 15. Create default configuration and documentation
  - [x] 15.1 Create default configuration file
    - Write default config.json with sensible defaults
    - Document all configuration options
    - _Requirements: 2.1, 2.2_

  - [x] 15.2 Write README with usage examples
    - Installation instructions
    - Quick start guide
    - Command reference
    - Configuration guide
    - Template customization guide

## Summary of Remaining Work

The core functionality is complete and working! The system can generate ceremonies, export to iCalendar format, and has comprehensive property-based tests. 

**What's left to implement:**

1. **Missing Property Tests** (7 tests):
   - Task 7.6: Sprint Retrospective property tests (Properties 35, 36, 37)
   - Task 11.2: Working day validation property tests (Properties 24, 25, 33, 34)
   - Task 11.4: Conflict detection property tests (Properties 26, 27)
   - Task 11.6: Alternative time proposals property test (Property 28)
   - Task 12.2: iCalendar format validity property test (Property 22)
   - Task 12.5: Summary completeness property test (Property 23)

2. **Conflict Resolution Enhancement** (Task 11.5):
   - Automatic conflict resolution with alternative time proposals

3. **CLI Enhancements** (Tasks 13.3-13.5):
   - Interactive 'configure' command
   - 'template' command for template management
   - 'validate' command for configuration validation

4. **Error Handling** (Task 14.1):
   - Comprehensive error handling with try-catch blocks
   - Input validation at module boundaries

**Current Status:** The system is functional and can be used to generate ceremonies. The remaining work focuses on additional property tests, enhanced CLI features, and improved error handling.
