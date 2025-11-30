/**
 * CLI Interface
 * Command-line interface for the Scrum Ceremony Scheduler
 */

import { generateReleaseDatesForYear } from '../core/dateCalculator.js';
import { generateCeremoniesForMultipleSprints } from '../services/ceremonyGenerator.js';
import { exportToICalendar, writeICalendarFile, generateCeremonySummary } from '../services/calendarExport.js';
import { SprintConfig } from '../core/types.js';

/**
 * Default sprint configuration
 */
function getDefaultConfig(): SprintConfig {
  return {
    durationWeeks: 3,
    ceremonies: {
      sprintPlanning: {
        name: 'Sprint Planning',
        dayOffset: 0,
        timeOfDay: '10:00',
        durationMinutes: 120,
        attendeeType: 'team',
        description: 'Sprint Planning',
        agenda: []
      },
      dailyStandup: {
        name: 'Daily Standup',
        dayOffset: 0,
        timeOfDay: '09:30',
        durationMinutes: 15,
        attendeeType: 'team',
        description: 'Daily Standup',
        agenda: []
      },
      sprintReview: {
        name: 'Sprint Review',
        dayOffset: -2,
        timeOfDay: '14:00',
        durationMinutes: 60,
        attendeeType: 'team-and-stakeholders',
        description: 'Sprint Review',
        agenda: []
      },
      sprintRetrospective: {
        name: 'Sprint Retrospective',
        dayOffset: 0,
        timeOfDay: '15:30',
        durationMinutes: 45,
        attendeeType: 'team',
        description: 'Sprint Retrospective',
        agenda: []
      }
    }
  };
}

/**
 * Parse command line arguments
 */
function parseArgs(args: string[]): { year?: number; output?: string; help?: boolean } {
  const result: { year?: number; output?: string; help?: boolean } = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--year' || arg === '-y') {
      result.year = parseInt(args[++i], 10);
    } else if (arg === '--output' || arg === '-o') {
      result.output = args[++i];
    }
  }
  
  return result;
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
Scrum Ceremony Scheduler
========================

Generate calendar invites for Scrum ceremonies aligned with monthly releases.

Usage:
  npm start -- [options]

Options:
  --year, -y <year>       Year to generate ceremonies for (default: current year)
  --output, -o <file>     Output file path (default: ceremonies.ics)
  --help, -h              Show this help message

Examples:
  npm start -- --year 2025
  npm start -- --year 2025 --output my-ceremonies.ics

The scheduler will:
  1. Calculate release dates (3rd Saturday of each month)
  2. Generate ceremonies for 3-week sprints
  3. Create Sprint Planning, Daily Standup, Sprint Review, and Sprint Retrospective
  4. Export to iCalendar format for import into your calendar app
`);
}

/**
 * Main CLI entry point
 */
export function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);
  
  if (options.help) {
    showHelp();
    return;
  }
  
  const year = options.year || new Date().getFullYear();
  const outputFile = options.output || 'ceremonies.ics';
  
  console.log('Scrum Ceremony Scheduler');
  console.log('========================\n');
  console.log(`Generating ceremonies for ${year}...`);
  
  try {
    // Generate release dates for the year
    const releaseDates = generateReleaseDatesForYear(year);
    console.log(`✓ Generated ${releaseDates.length} release dates`);
    
    // Generate ceremonies
    const config = getDefaultConfig();
    const ceremonies = generateCeremoniesForMultipleSprints(releaseDates, config, []);
    console.log(`✓ Generated ${ceremonies.length} ceremonies`);
    
    // Export to iCalendar file
    writeICalendarFile(ceremonies, outputFile);
    console.log(`✓ Exported to ${outputFile}`);
    
    // Display summary
    console.log('\n' + generateCeremonySummary(ceremonies));
    
    console.log(`\n✓ Done! Import ${outputFile} into your calendar application.`);
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run CLI when executed directly
main();
