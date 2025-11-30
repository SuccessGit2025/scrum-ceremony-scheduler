/**
 * Calendar Export Service
 * Converts ceremony invites to iCalendar format
 */

import { CeremonyInvite } from '../core/types.js';
import * as fs from 'fs';

/**
 * Format a date for iCalendar (YYYYMMDDTHHMMSS)
 */
function formatICalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a VEVENT component for a single ceremony
 */
export function generateVEvent(ceremony: CeremonyInvite): string {
  const lines: string[] = [];
  
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${ceremony.id}`);
  lines.push(`DTSTART:${formatICalDate(ceremony.startDateTime)}`);
  lines.push(`DTEND:${formatICalDate(ceremony.endDateTime)}`);
  lines.push(`SUMMARY:${escapeICalText(ceremony.title)}`);
  lines.push(`DESCRIPTION:${escapeICalText(ceremony.description)}`);
  
  // Add attendees
  ceremony.attendees.forEach(attendee => {
    lines.push(`ATTENDEE:mailto:${attendee}`);
  });
  
  // Add location if present
  if (ceremony.location) {
    lines.push(`LOCATION:${escapeICalText(ceremony.location)}`);
  }
  
  // Add recurrence rule if present
  if (ceremony.recurrence) {
    const freq = ceremony.recurrence.frequency.toUpperCase();
    const until = formatICalDate(ceremony.recurrence.until);
    
    // Build RRULE with optional BYDAY parameter
    let rrule = `RRULE:FREQ=${freq};UNTIL=${until}`;
    if (ceremony.recurrence.byDay && ceremony.recurrence.byDay.length > 0) {
      rrule += `;BYDAY=${ceremony.recurrence.byDay.join(',')}`;
    }
    lines.push(rrule);
    
    // Add exception dates for holidays
    if (ceremony.recurrence.excludeDates.length > 0) {
      const exdates = ceremony.recurrence.excludeDates
        .map(d => formatICalDate(d))
        .join(',');
      lines.push(`EXDATE:${exdates}`);
    }
  }
  
  lines.push('END:VEVENT');
  
  return lines.join('\r\n');
}

/**
 * Export ceremonies to iCalendar format
 */
export function exportToICalendar(ceremonies: CeremonyInvite[]): string {
  const lines: string[] = [];
  
  // iCalendar header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Scrum Ceremony Scheduler//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  
  // Add each ceremony as a VEVENT
  ceremonies.forEach(ceremony => {
    lines.push(generateVEvent(ceremony));
  });
  
  // iCalendar footer
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Write ceremonies to an iCalendar file
 */
export function writeICalendarFile(
  ceremonies: CeremonyInvite[],
  filepath: string
): void {
  const icalContent = exportToICalendar(ceremonies);
  fs.writeFileSync(filepath, icalContent, 'utf-8');
}

/**
 * Generate a human-readable summary of ceremonies
 */
export function generateCeremonySummary(ceremonies: CeremonyInvite[]): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('SCRUM CEREMONY SCHEDULE');
  lines.push('='.repeat(60));
  lines.push('');
  
  // Group by sprint
  const bySprint = new Map<number, CeremonyInvite[]>();
  ceremonies.forEach(ceremony => {
    if (!bySprint.has(ceremony.sprintNumber)) {
      bySprint.set(ceremony.sprintNumber, []);
    }
    bySprint.get(ceremony.sprintNumber)!.push(ceremony);
  });
  
  // Sort sprints
  const sortedSprints = Array.from(bySprint.keys()).sort((a, b) => a - b);
  
  sortedSprints.forEach(sprintNum => {
    const sprintCeremonies = bySprint.get(sprintNum)!;
    lines.push(`Sprint ${sprintNum}`);
    lines.push('-'.repeat(60));
    
    // Sort ceremonies by date
    sprintCeremonies.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    
    sprintCeremonies.forEach(ceremony => {
      const date = ceremony.startDateTime.toLocaleDateString();
      const time = ceremony.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const duration = (ceremony.endDateTime.getTime() - ceremony.startDateTime.getTime()) / (1000 * 60);
      
      lines.push(`  ${ceremony.title}`);
      lines.push(`    Date: ${date} at ${time}`);
      lines.push(`    Duration: ${duration} minutes`);
      
      if (ceremony.recurrence) {
        lines.push(`    Recurrence: ${ceremony.recurrence.frequency} until ${ceremony.recurrence.until.toLocaleDateString()}`);
      }
      
      lines.push('');
    });
    
    lines.push('');
  });
  
  lines.push('='.repeat(60));
  lines.push(`Total Ceremonies: ${ceremonies.length}`);
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}
