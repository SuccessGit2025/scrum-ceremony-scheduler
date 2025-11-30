/**
 * Template Manager
 * Handles loading, storing, and rendering ceremony templates
 */

import { CeremonyTemplate } from '../core/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default template storage directory
const DEFAULT_TEMPLATE_DIR = path.join(__dirname, '../../templates');

/**
 * Get the template file path for a ceremony type and optional team ID
 */
function getTemplatePath(ceremonyType: string, teamId?: string): string {
  const baseDir = teamId 
    ? path.join(DEFAULT_TEMPLATE_DIR, 'teams', teamId)
    : DEFAULT_TEMPLATE_DIR;
  
  return path.join(baseDir, `${ceremonyType}.json`);
}

/**
 * Ensure directory exists, creating it if necessary
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Load a ceremony template
 * @param ceremonyType - The type of ceremony (sprint-planning, daily-standup, etc.)
 * @param teamId - Optional team identifier for team-specific templates
 * @returns The loaded ceremony template
 * @throws Error if template file doesn't exist or is invalid
 */
export function loadTemplate(
  ceremonyType: string,
  teamId?: string
): CeremonyTemplate {
  const templatePath = getTemplatePath(ceremonyType, teamId);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${ceremonyType}${teamId ? ` for team ${teamId}` : ''}`);
  }
  
  const templateData = fs.readFileSync(templatePath, 'utf-8');
  const template = JSON.parse(templateData) as CeremonyTemplate;
  
  // Validate template structure
  if (!template.ceremonyType || !template.title || !template.description || !Array.isArray(template.agenda)) {
    throw new Error(`Invalid template structure in ${templatePath}`);
  }
  
  return template;
}

/**
 * Render a template with variable substitution
 * Replaces {{variable_name}} patterns with actual values
 * @param template - The ceremony template to render
 * @param variables - Key-value pairs for variable substitution
 * @returns Rendered string with all variables replaced
 */
export function renderTemplate(
  template: CeremonyTemplate,
  variables: Record<string, string>
): string {
  // Start with the template description
  let rendered = template.description;
  
  // Add agenda if present
  if (template.agenda && template.agenda.length > 0) {
    rendered += '\n\nAgenda:\n';
    template.agenda.forEach((item, index) => {
      rendered += `${index + 1}. ${item}\n`;
    });
  }
  
  // Replace all variables in the format {{variable_name}}
  Object.entries(variables).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(pattern, value);
  });
  
  return rendered;
}

/**
 * Save a ceremony template
 * @param ceremonyType - The type of ceremony
 * @param template - The template to save
 * @param teamId - Optional team identifier for team-specific templates
 */
export function saveTemplate(
  ceremonyType: string,
  template: CeremonyTemplate,
  teamId?: string
): void {
  const templatePath = getTemplatePath(ceremonyType, teamId);
  const templateDir = path.dirname(templatePath);
  
  // Ensure directory exists
  ensureDirectoryExists(templateDir);
  
  // Validate template structure
  if (!template.ceremonyType || !template.title || !template.description || !Array.isArray(template.agenda)) {
    throw new Error('Invalid template structure: missing required fields');
  }
  
  // Write template to file
  const templateData = JSON.stringify(template, null, 2);
  fs.writeFileSync(templatePath, templateData, 'utf-8');
}
