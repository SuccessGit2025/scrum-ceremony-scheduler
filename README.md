# Scrum Ceremony Scheduler

Automated calendar invite generator for Scrum ceremonies aligned with monthly release cadence.

## Overview

The Scrum Ceremony Scheduler automatically generates calendar invites for all four core Scrum ceremonies (Sprint Planning, Daily Standup, Sprint Review, and Sprint Retrospective) based on a monthly release schedule where releases occur on the third Saturday of each month.

## Features

- ✅ Automatic calculation of release dates (3rd Saturday of each month)
- ✅ Configurable sprint duration (1-4 weeks)
- ✅ Generates all four Scrum ceremonies with proper timing
- ✅ Customizable ceremony templates
- ✅ Team-specific template support
- ✅ Holiday and working day handling
- ✅ iCalendar (RFC 5545) export format
- ✅ Property-based testing for correctness

## Installation

```bash
npm install
npm run build
```

## Quick Start

Generate ceremonies for the current year:

```bash
npm start
```

This will create a `ceremonies.ics` file that you can import into any calendar application (Google Calendar, Outlook, Apple Calendar, etc.).

## Usage

### Basic Usage

Generate ceremonies for a specific year:

```bash
npm start -- --year 2025
```

Specify a custom output file:

```bash
npm start -- --year 2025 --output my-team-ceremonies.ics
```

### Command Line Options

- `--year, -y <year>` - Year to generate ceremonies for (default: current year)
- `--output, -o <file>` - Output file path (default: ceremonies.ics)
- `--help, -h` - Show help message

## Configuration

The system uses a `config.json` file for configuration. You can customize:

### Sprint Configuration

```json
{
  "sprintDurationWeeks": 3,
  "ceremonies": {
    "sprintPlanning": {
      "dayOffset": 0,
      "timeOfDay": "09:00",
      "durationMinutes": 120
    }
  }
}
```

**Configuration Options:**

- `sprintDurationWeeks` - Sprint duration (2 or 3 weeks)
- `dayOffset` - Days relative to sprint start/release date
- `timeOfDay` - Time in HH:MM format (24-hour)
- `durationMinutes` - Ceremony duration in minutes
- `attendeeType` - "team" or "team-and-stakeholders"

### Ceremony Timing

By default, ceremonies are scheduled as follows:

- **Sprint Planning**: First day of sprint at 9:00 AM (2 hours)
- **Daily Standup**: Every working day at 9:30 AM (15 minutes)
- **Sprint Review**: 2 days before release at 2:00 PM (1 hour)
- **Sprint Retrospective**: After Sprint Review at 3:30 PM (1.5 hours)

### Holidays

Add holidays to exclude them from Daily Standup scheduling:

```json
{
  "holidays": [
    { "date": "2025-01-01", "name": "New Year's Day" },
    { "date": "2025-12-25", "name": "Christmas Day" }
  ]
}
```

## Template Customization

Ceremony invites are generated from customizable templates located in the `templates/` directory.

### Template Variables

Templates support the following variables:

- `{{sprint_number}}` - Sprint number (1, 2, 3, ...)
- `{{release_date}}` - Release date (YYYY-MM-DD)
- `{{sprint_start}}` - Sprint start date (YYYY-MM-DD)
- `{{sprint_end}}` - Sprint end date (YYYY-MM-DD)

### Example Template

```json
{
  "ceremonyType": "sprint-planning",
  "title": "Sprint Planning - Sprint {{sprint_number}}",
  "description": "Planning for Sprint {{sprint_number}}\\n\\nRelease Date: {{release_date}}",
  "agenda": [
    "Review sprint goal",
    "Select backlog items"
  ],
  "variables": ["sprint_number", "release_date"]
}
```

### Team-Specific Templates

Create team-specific templates by placing them in `templates/teams/<team-id>/`:

```
templates/
  ├── sprint-planning.json          # Default template
  └── teams/
      └── team-alpha/
          └── sprint-planning.json  # Team Alpha's template
```

## Development

### Running Tests

```bash
npm test
```

The project uses property-based testing with fast-check to ensure correctness across a wide range of inputs.

### Test Coverage

- ✅ Date calculations (third Saturday, working days)
- ✅ Sprint boundary calculations
- ✅ Ceremony generation (all 4 types)
- ✅ Template rendering and variable substitution
- ✅ Team-specific template isolation
- ✅ Multi-sprint generation
- ✅ Attendee management

### Building

```bash
npm run build
```

## Architecture

The system follows a layered architecture:

```
CLI Layer
  ↓
Ceremony Generation Service
  ↓
Date Calculator + Template Manager
  ↓
Calendar Export Service
```

### Key Components

- **Date Calculator**: Calculates release dates, working days, and sprint boundaries
- **Template Manager**: Loads and renders ceremony templates with variable substitution
- **Ceremony Generator**: Orchestrates ceremony creation for all types
- **Calendar Export**: Converts ceremonies to iCalendar (RFC 5545) format
- **CLI**: Command-line interface for easy usage

## How It Works

1. **Calculate Release Dates**: Determines the 3rd Saturday of each month
2. **Calculate Sprint Boundaries**: Works backward from release dates to determine sprint start/end
3. **Generate Ceremonies**: Creates all 4 ceremony types for each sprint:
   - Sprint Planning at sprint start
   - Daily Standup recurring on working days
   - Sprint Review before release
   - Sprint Retrospective after review
4. **Apply Templates**: Populates ceremony details from customizable templates
5. **Export to iCalendar**: Generates RFC 5545 compliant .ics file

## Release Cadence

The system is designed for teams that release on the **third Saturday of each month**:

- January: 3rd Saturday
- February: 3rd Saturday
- March: 3rd Saturday
- ... and so on

Sprints are scheduled to end just before the release date, with Sprint Review happening 2 days before release by default.

## Example Output

```
==========================================================
SCRUM CEREMONY SCHEDULE
==========================================================

Sprint 1
----------------------------------------------------------
  Sprint Planning - Sprint 1
    Date: 12/30/2024 at 09:00
    Duration: 120 minutes

  Daily Standup - Sprint 1
    Date: 12/30/2024 at 09:30
    Duration: 15 minutes
    Recurrence: daily until 1/17/2025

  Sprint Review - Sprint 1
    Date: 1/16/2025 at 14:00
    Duration: 60 minutes

  Sprint Retrospective - Sprint 1
    Date: 1/16/2025 at 15:30
    Duration: 90 minutes

...

==========================================================
Total Ceremonies: 48
==========================================================
```

## Importing to Calendar Apps

### Google Calendar

1. Open Google Calendar
2. Click the "+" next to "Other calendars"
3. Select "Import"
4. Choose the generated `.ics` file
5. Select the calendar to import to
6. Click "Import"

### Outlook

1. Open Outlook
2. Go to File > Open & Export > Import/Export
3. Select "Import an iCalendar (.ics) or vCalendar file"
4. Browse to the generated `.ics` file
5. Click "OK"

### Apple Calendar

1. Open Calendar app
2. Go to File > Import
3. Select the generated `.ics` file
4. Choose the calendar to import to
5. Click "Import"

## Troubleshooting

### Ceremonies not appearing

- Ensure the `.ics` file was generated successfully
- Check that your calendar app supports iCalendar format
- Verify the year parameter is correct

### Wrong ceremony times

- Check the `config.json` file for correct `timeOfDay` values
- Ensure times are in 24-hour format (HH:MM)
- Verify your timezone settings in your calendar app

### Missing Daily Standups

- Check that holidays are correctly configured
- Verify working days are set correctly
- Ensure the sprint duration covers the expected date range

## Contributing

This project uses property-based testing to ensure correctness. When adding features:

1. Write property tests that describe universal truths
2. Write unit tests for specific examples
3. Ensure all tests pass before committing

## License

MIT

## Support

For issues or questions, please open an issue on the project repository.
