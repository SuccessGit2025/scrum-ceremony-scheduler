# Design Document: Scrum Ceremony Scheduler

## Overview

The Scrum Ceremony Scheduler is a system that automates the generation of calendar invites for the four core Scrum ceremonies (Sprint Planning, Daily Standup, Sprint Review, and Sprint Retrospective) aligned with a monthly release cadence. The system calculates release dates as the third Saturday of each month and schedules all ceremonies relative to these anchor dates.

The system provides a command-line interface for Scrum Masters to configure sprint parameters, customize ceremony templates, and generate calendar invites in iCalendar format for easy import into calendar applications.

## Architecture

The system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         CLI Interface Layer             │
│  (Command parsing, user interaction)    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Ceremony Generation Service        │
│  (Orchestrates ceremony scheduling)     │
└─────────────────────────────────────────┘
                  ↓
┌──────────────────┬──────────────────────┐
│  Date Calculator │  Template Manager    │
│  (Release dates, │  (Ceremony templates,│
│   working days)  │   customization)     │
└──────────────────┴──────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Calendar Export Service            │
│  (iCalendar format generation)          │
└─────────────────────────────────────────┘
```

**Key Architectural Decisions:**

1. **Functional Core, Imperative Shell**: Core date calculations and ceremony scheduling logic are pure functions, while I/O operations (file writing, user input) are handled at the boundaries
2. **Template-Based Generation**: Ceremony invites are generated from customizable templates, allowing teams to adapt the system to their needs
3. **iCalendar Standard**: Output uses the widely-supported iCalendar (RFC 5545) format for maximum compatibility
4. **Configuration-Driven**: All ceremony timings, durations, and templates are externalized to configuration files

## Components and Interfaces

### 1. Date Calculator

**Responsibilities:**
- Calculate the third Saturday of any given month
- Determine working days within a date range
- Handle holiday exclusions
- Calculate ceremony dates relative to release dates

**Key Functions:**
```typescript
calculateThirdSaturday(year: number, month: number): Date
getWorkingDays(startDate: Date, endDate: Date, holidays: Date[]): Date[]
isWorkingDay(date: Date, holidays: Date[]): boolean
addWorkingDays(date: Date, days: number, holidays: Date[]): Date
```

### 2. Ceremony Configuration

**Responsibilities:**
- Store ceremony timing and duration settings
- Validate configuration parameters
- Provide default ceremony configurations

**Data Structure:**
```typescript
interface CeremonyConfig {
  name: string;
  dayOffset: number;        // Days relative to sprint start/end
  timeOfDay: string;        // HH:MM format
  durationMinutes: number;
  attendeeType: 'team' | 'team-and-stakeholders';
  description: string;
  agenda: string[];
}

interface SprintConfig {
  durationWeeks: number;    // 2 or 3 weeks
  ceremonies: {
    sprintPlanning: CeremonyConfig;
    dailyStandup: CeremonyConfig;
    sprintReview: CeremonyConfig;
    sprintRetrospective: CeremonyConfig;
  };
}
```

### 3. Template Manager

**Responsibilities:**
- Load and store ceremony templates
- Support template variables (e.g., {{sprint_number}}, {{release_date}})
- Render templates with actual values

**Key Functions:**
```typescript
loadTemplate(ceremonyType: string, teamId?: string): CeremonyTemplate
renderTemplate(template: CeremonyTemplate, variables: Record<string, string>): string
saveTemplate(ceremonyType: string, template: CeremonyTemplate, teamId?: string): void
```

### 4. Ceremony Generation Service

**Responsibilities:**
- Orchestrate the generation of all ceremony invites
- Calculate ceremony dates based on release dates and sprint configuration
- Handle conflict detection and rescheduling
- Generate ceremony invite objects

**Key Functions:**
```typescript
generateCeremoniesForSprint(
  releaseDate: Date,
  sprintConfig: SprintConfig,
  holidays: Date[]
): CeremonyInvite[]

generateCeremoniesForMultipleSprints(
  releaseDates: Date[],
  sprintConfig: SprintConfig,
  holidays: Date[]
): CeremonyInvite[]

detectConflicts(ceremonies: CeremonyInvite[]): Conflict[]
```

### 5. Calendar Export Service

**Responsibilities:**
- Convert ceremony invites to iCalendar format
- Generate .ics files for import into calendar applications
- Support both individual and batch export

**Key Functions:**
```typescript
exportToICalendar(ceremonies: CeremonyInvite[]): string
writeICalendarFile(ceremonies: CeremonyInvite[], filepath: string): void
generateVEvent(ceremony: CeremonyInvite): string
```

### 6. CLI Interface

**Responsibilities:**
- Parse command-line arguments
- Provide interactive configuration prompts
- Display ceremony summaries
- Handle file I/O for configuration and output

**Commands:**
```
scrum-scheduler generate --year 2025 --sprints 12
scrum-scheduler configure --sprint-duration 2
scrum-scheduler template edit --ceremony sprint-planning
scrum-scheduler validate --config config.json
```

## Data Models

### CeremonyInvite
```typescript
interface CeremonyInvite {
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
```

### RecurrenceRule
```typescript
interface RecurrenceRule {
  frequency: 'daily' | 'weekly';
  until: Date;
  excludeDates: Date[];
}
```

### Conflict
```typescript
interface Conflict {
  ceremony: CeremonyInvite;
  conflictType: 'holiday' | 'overlap' | 'external-event';
  conflictDate: Date;
  description: string;
  suggestedAlternative?: Date;
}
```

### Holiday
```typescript
interface Holiday {
  date: Date;
  name: string;
  country?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Third Saturday Calculation
*For any* year and month, when calculating the release date, the result should be a Saturday and it should be the third occurrence of Saturday in that month.
**Validates: Requirements 1.1**

### Property 2: Release Date Count Matches Request
*For any* list of months requested, the number of release dates generated should equal the number of months in the request.
**Validates: Requirements 1.3**

### Property 3: Date Serialization Round Trip
*For any* calculated release date, serializing to ISO 8601 format and then parsing should produce an equivalent date.
**Validates: Requirements 1.4**

### Property 4: Year Request Generates Twelve Dates
*For any* year, requesting release dates for that year should generate exactly 12 release dates.
**Validates: Requirements 1.5**

### Property 5: Sprint Duration Validation
*For any* integer value, the sprint duration validator should accept values of 2 or 3 and reject all other values.
**Validates: Requirements 2.1**

### Property 6: Ceremony Configuration Completeness
*For any* ceremony configuration, validation should ensure that day offset, time, and duration fields are all present and valid.
**Validates: Requirements 2.2**

### Property 7: Sprint Planning at Sprint Start
*For any* sprint configuration and release date, Sprint Planning should be scheduled on the first day of the sprint.
**Validates: Requirements 2.3**

### Property 8: Sprint Review Before Release
*For any* sprint configuration and release date, Sprint Review should be scheduled before the release date.
**Validates: Requirements 2.4**

### Property 9: Sprint Retrospective Ordering
*For any* sprint configuration, Sprint Retrospective should be scheduled after Sprint Review and before the next sprint begins.
**Validates: Requirements 2.5**

### Property 10: Ceremony Invite Completeness
*For any* generated ceremony invite (Sprint Planning, Sprint Review, or Sprint Retrospective), it should contain all required fields: title, date, time, duration, and description.
**Validates: Requirements 3.1, 5.1, 6.1**

### Property 11: Configuration Duration Applied
*For any* ceremony type and configured duration, the generated invite's duration should match the configured value.
**Validates: Requirements 3.3, 5.3, 6.3**

### Property 12: Agenda Included in Sprint Planning
*For any* generated Sprint Planning invite, the description field should contain agenda content.
**Validates: Requirements 3.4**

### Property 13: Attendee List Preservation
*For any* list of attendees provided for a ceremony, all attendees should appear in the generated invite's attendee list.
**Validates: Requirements 3.5, 5.5**

### Property 14: Daily Standup Working Days Only
*For any* sprint duration and holiday list, all Daily Standup occurrences should fall on working days (not weekends or holidays).
**Validates: Requirements 4.1, 4.2**

### Property 15: Daily Standup Consistent Time
*For any* Daily Standup schedule, all occurrences should have the same time of day.
**Validates: Requirements 4.3**

### Property 16: Daily Standup Ends With Sprint
*For any* sprint, the last Daily Standup occurrence should be on or before the last working day of the sprint.
**Validates: Requirements 4.5**

### Property 17: Demonstration Guidelines in Sprint Review
*For any* generated Sprint Review invite, the description field should contain demonstration guidelines.
**Validates: Requirements 5.4**

### Property 18: Team-Only Attendees for Retrospective
*For any* Sprint Retrospective invite with team members and stakeholders provided, only team members should appear in the attendee list.
**Validates: Requirements 6.5**

### Property 19: Retrospective Format Guidelines Included
*For any* generated Sprint Retrospective invite, the description field should contain retrospective format guidelines.
**Validates: Requirements 6.4**

### Property 20: All Ceremony Types Generated Per Sprint
*For any* number of sprints requested, the system should generate all four ceremony types (Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective) for each sprint.
**Validates: Requirements 7.1**

### Property 21: No Ceremony Overlap Between Sprints
*For any* two consecutive sprints, all ceremonies from sprint N should end before ceremonies from sprint N+1 begin.
**Validates: Requirements 7.2**

### Property 22: Valid iCalendar Format Output
*For any* generated ceremony list, the exported output should be valid iCalendar (RFC 5545) format that can be parsed by standard calendar applications.
**Validates: Requirements 7.3**

### Property 23: Summary Contains All Ceremonies
*For any* generated ceremony list, the summary should include entries for all ceremonies with their dates and times.
**Validates: Requirements 7.4**

### Property 24: Holidays Excluded from Scheduling
*For any* list of holidays, no ceremonies should be scheduled on those dates.
**Validates: Requirements 8.1**

### Property 25: Holiday Rescheduling to Next Working Day
*For any* ceremony that would naturally fall on a holiday, the actual scheduled date should be the next available working day.
**Validates: Requirements 8.2**

### Property 26: Conflict Detection with Company Events
*For any* list of company events, the system should detect and report when ceremonies overlap with those events.
**Validates: Requirements 8.3**

### Property 27: Conflict Report Completeness
*For any* detected conflict, the conflict report should contain details of both the ceremony and the conflicting event.
**Validates: Requirements 8.4**

### Property 28: Alternative Times Proposed for Conflicts
*For any* conflict when automatic rescheduling is enabled, the system should propose at least one alternative time that doesn't conflict.
**Validates: Requirements 8.5**

### Property 29: Template Storage Round Trip
*For any* ceremony template, saving and then loading the template should produce an equivalent template with all fields preserved.
**Validates: Requirements 9.1**

### Property 30: Template Content in Generated Invites
*For any* template, the generated invite should contain the template's title, description, and agenda content.
**Validates: Requirements 9.2**

### Property 31: Template Variable Replacement
*For any* template containing variables (e.g., {{sprint_number}}, {{release_date}}), all variables should be replaced with actual values in the generated invite.
**Validates: Requirements 9.3**

### Property 32: Team-Specific Template Isolation
*For any* team ID, the system should be able to store and retrieve team-specific templates without affecting other teams' templates.
**Validates: Requirements 9.5**

### Property 33: No Ceremonies on Non-Working Days
*For any* generated ceremony, the scheduled date should be a working day (not a weekend or holiday).
**Validates: Requirements 10.1, 10.4**

### Property 34: Weekend Rescheduling to Working Day
*For any* ceremony that would naturally fall on a weekend, the actual scheduled date should be the next available working day.
**Validates: Requirements 10.2**

### Property 35: Sprint Retrospective Default Duration
*For any* Sprint Retrospective invite when duration is not explicitly configured, the duration should be 45 minutes.
**Validates: Requirements 6.4**

### Property 36: Sprint Review and Retrospective on Different Days
*For any* sprint, Sprint Review and Sprint Retrospective should be scheduled on different calendar days.
**Validates: Requirements 6.2**

### Property 37: Sprint Retrospective After Sprint End
*For any* sprint, Sprint Retrospective should be scheduled after the sprint end date.
**Validates: Requirements 6.2**

## Error Handling

The system implements comprehensive error handling across all layers:

### Input Validation Errors
- **Invalid Sprint Duration**: Return error message specifying valid values (2 or 3 weeks)
- **Invalid Date Format**: Return error with expected ISO 8601 format
- **Missing Required Configuration**: Return error listing missing fields
- **Invalid Time Format**: Return error with expected HH:MM format

### Date Calculation Errors
- **Invalid Month/Year**: Return error for out-of-range values
- **No Working Days Available**: Return error when all days in range are holidays
- **Date Arithmetic Overflow**: Return error for dates outside supported range

### Template Errors
- **Template Not Found**: Return error with available template names
- **Invalid Template Variable**: Return error listing valid variable names
- **Template Parse Error**: Return error with line number and description

### Calendar Export Errors
- **File Write Permission**: Return error with file path and permission details
- **Invalid iCalendar Data**: Return error with validation details
- **Encoding Error**: Return error with character encoding information

### Conflict Resolution Errors
- **No Alternative Times Available**: Return error indicating manual intervention needed
- **Circular Dependency**: Return error when rescheduling creates new conflicts

**Error Response Format:**
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}
```

## Testing Strategy

The system employs a dual testing approach combining unit tests and property-based tests to ensure comprehensive correctness validation.

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and integration points:

**Key Unit Test Areas:**
- Third Saturday calculation for specific known months (e.g., January 2025 → January 18)
- Empty input handling (empty attendee lists, empty template variables)
- Boundary conditions (1-week sprints, 4-week sprints)
- Holiday edge cases (ceremony on holiday, consecutive holidays)
- iCalendar format validation for specific ceremony types
- CLI command parsing for known command patterns

**Example Unit Tests:**
- Test that January 2025's third Saturday is January 18, 2025
- Test that an empty attendee list produces an invite with no attendees
- Test that a 1-week sprint generates correct ceremony count
- Test that Sprint Planning on a holiday reschedules to next working day

### Property-Based Testing Approach

Property-based tests verify universal properties that should hold across all inputs. The system uses **fast-check** (for TypeScript/JavaScript) as the property-based testing library.

**Property Test Configuration:**
- Each property test MUST run a minimum of 100 iterations
- Each property test MUST be tagged with a comment referencing the design document property
- Tag format: `// Feature: scrum-ceremony-scheduler, Property N: [property description]`
- Each correctness property MUST be implemented by a SINGLE property-based test

**Key Property Test Areas:**
- Date calculations with random years, months, and holiday lists
- Ceremony generation with random sprint configurations
- Template rendering with random variable sets
- Conflict detection with random event lists
- iCalendar format validation with random ceremony data

**Example Property Tests:**
```typescript
// Feature: scrum-ceremony-scheduler, Property 1: Third Saturday Calculation
test('third Saturday is always a Saturday and third occurrence', () => {
  fc.assert(fc.property(
    fc.integer({ min: 2020, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    (year, month) => {
      const date = calculateThirdSaturday(year, month);
      return date.getDay() === 6 && isThirdOccurrence(date, year, month);
    }
  ), { numRuns: 100 });
});
```

**Generator Strategy:**
- Smart generators that constrain to valid input space (e.g., years 2020-2050, valid time strings)
- Composite generators for complex objects (sprint configurations, ceremony templates)
- Shrinking support to find minimal failing examples

### Integration Testing

Integration tests verify end-to-end workflows:
- Generate ceremonies for a full year and export to iCalendar file
- Load configuration, generate ceremonies, detect conflicts, and produce summary
- CLI command execution with file I/O

### Test Coverage Goals

- Unit tests: Cover specific examples and edge cases
- Property tests: Cover all 32 correctness properties from design document
- Integration tests: Cover main user workflows
- Target: 90%+ code coverage with emphasis on core logic

## Performance Considerations

### Time Complexity
- Third Saturday calculation: O(1) - direct arithmetic
- Working days calculation: O(n) where n is number of days in range
- Ceremony generation for k sprints: O(k * d) where d is sprint duration in days
- Conflict detection: O(n²) where n is number of ceremonies (can be optimized with interval trees)

### Space Complexity
- Configuration storage: O(1) - fixed size
- Ceremony storage: O(k * c) where k is number of sprints and c is ceremonies per sprint
- iCalendar output: O(k * c) - proportional to number of ceremonies

### Optimization Strategies
- Cache third Saturday calculations for frequently accessed months
- Use interval trees for efficient conflict detection with large event lists
- Stream iCalendar output for very large ceremony lists
- Lazy evaluation for Daily Standup recurrence rules

## Security Considerations

### Input Validation
- Sanitize all user inputs to prevent injection attacks
- Validate file paths to prevent directory traversal
- Limit configuration file size to prevent DoS

### File System Access
- Restrict file operations to designated configuration and output directories
- Validate file permissions before writing
- Use secure temporary files for intermediate processing

### Data Privacy
- Attendee email addresses should be validated but not logged
- Configuration files may contain sensitive team information - restrict permissions
- No external network calls - all processing is local

## Deployment and Configuration

### Installation
```bash
npm install -g scrum-ceremony-scheduler
```

### Configuration File Location
- User config: `~/.scrum-scheduler/config.json`
- Project config: `./.scrum-scheduler/config.json`
- Templates: `~/.scrum-scheduler/templates/`

### Default Configuration
```json
{
  "sprintDurationWeeks": 2,
  "ceremonies": {
    "sprintPlanning": {
      "dayOffset": 0,
      "timeOfDay": "09:00",
      "durationMinutes": 120
    },
    "dailyStandup": {
      "timeOfDay": "09:30",
      "durationMinutes": 15
    },
    "sprintReview": {
      "dayOffset": -2,
      "timeOfDay": "14:00",
      "durationMinutes": 60
    },
    "sprintRetrospective": {
      "dayOffset": -1,
      "timeOfDay": "15:00",
      "durationMinutes": 45
    }
  },
  "holidays": [],
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
}
```

## Future Enhancements

- **Calendar API Integration**: Direct integration with Google Calendar, Outlook, etc.
- **Time Zone Support**: Handle ceremonies across multiple time zones
- **Capacity Planning**: Suggest optimal ceremony times based on team availability
- **Historical Analytics**: Track ceremony attendance and effectiveness
- **Slack/Teams Integration**: Send ceremony reminders via chat platforms
- **Multi-Team Coordination**: Coordinate ceremonies across dependent teams
- **Custom Recurrence Patterns**: Support non-standard sprint cadences
