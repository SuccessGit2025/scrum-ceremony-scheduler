# Implementation Plan

- [ ] 1. Set up React project with Vite and TypeScript
  - Initialize Vite project with React and TypeScript template
  - Install dependencies: React, TypeScript, Tailwind CSS, fast-check, Vitest, React Testing Library
  - Configure Tailwind CSS with PostCSS
  - Set up TypeScript configuration for strict type checking
  - Create basic project structure (components, hooks, utils, types)
  - _Requirements: 1.1, 1.2_

- [ ] 2. Create shared types and interfaces
  - Define CeremonyConfig interface for web application
  - Define ValidationErrors and ValidationResult interfaces
  - Define SavedConfig interface for local storage
  - Create type definitions for ceremony generation (reuse from core)
  - _Requirements: 2.1, 3.1, 10.2_

- [ ] 3. Implement validation service
- [ ] 3.1 Create validation functions for all form inputs
  - Implement validateYear function (2020-2100 range)
  - Implement validateSprintDuration function (2 or 3 only)
  - Implement validateSprintCount function (1-24 range)
  - Implement validateTime function (HH:MM format)
  - Implement validateDuration function (positive integers)
  - Implement validateHolidays function (ISO date format)
  - Implement validateCompleteConfig function
  - _Requirements: 2.2, 2.4, 3.2, 3.3, 7.2_

- [ ] 3.2 Write property test for year validation
  - **Property 2: Year Validation Range**
  - **Validates: Requirements 2.2**

- [ ] 3.3 Write property test for sprint count validation
  - **Property 3: Sprint Count Validation Range**
  - **Validates: Requirements 2.4**

- [ ] 3.4 Write property test for time format validation
  - **Property 5: Time Format Validation**
  - **Validates: Requirements 3.2**

- [ ] 3.5 Write property test for duration validation
  - **Property 6: Duration Validation Positive Integer**
  - **Validates: Requirements 3.3**

- [ ] 3.6 Write property test for holiday date validation
  - **Property 20: Holiday Date Format Validation**
  - **Validates: Requirements 7.2**

- [ ] 4. Implement configuration manager for local storage
- [ ] 4.1 Create configuration storage functions
  - Implement saveConfig function to store in local storage
  - Implement loadConfig function to retrieve from local storage
  - Implement listConfigs function to get all saved configurations
  - Implement deleteConfig function to remove configurations
  - Add error handling for storage quota and disabled storage
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 4.2 Write property test for configuration round trip
  - **Property 25: Configuration Storage Round Trip**
  - **Validates: Requirements 10.2, 10.3, 10.4**

- [ ] 4.3 Write property test for named configuration management
  - **Property 26: Named Configuration Management**
  - **Validates: Requirements 10.5**

- [ ] 5. Create ceremony generation wrapper for web
- [ ] 5.1 Adapt core ceremony generation logic for browser use
  - Import and wrap existing ceremony generation functions
  - Create browser-compatible date calculation utilities
  - Implement ceremony generation with holiday exclusion
  - Add conflict detection logic
  - Ensure no network calls during generation
  - _Requirements: 1.3, 7.3, 7.4, 9.3_

- [ ] 5.2 Write property test for no backend network calls
  - **Property 1: No Backend Network Calls During Generation**
  - **Validates: Requirements 1.3, 9.3**

- [ ] 5.3 Write property test for holiday exclusion
  - **Property 21: Holidays Excluded from Scheduling**
  - **Validates: Requirements 7.3**

- [ ] 5.4 Write property test for holiday rescheduling
  - **Property 22: Holiday Rescheduling to Working Day**
  - **Validates: Requirements 7.4**

- [ ] 6. Implement iCalendar export for browser
- [ ] 6.1 Create browser download functionality
  - Implement function to convert ceremonies to iCalendar format
  - Create Blob with text/calendar MIME type
  - Implement browser download trigger with proper filename
  - Add filename formatting with year (ceremonies-{year}.ics)
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 6.2 Write property test for download filename format
  - **Property 13: Download Filename Format**
  - **Validates: Requirements 5.2**

- [ ] 6.3 Write property test for iCalendar RFC compliance
  - **Property 14: iCalendar RFC 5545 Compliance**
  - **Validates: Requirements 5.4**

- [ ] 7. Build configuration form component
- [ ] 7.1 Create form UI with all input fields
  - Create year input field with validation
  - Create sprint duration radio buttons (2 or 3 weeks)
  - Create number of sprints input field
  - Create ceremony time inputs for all four ceremonies
  - Create ceremony duration inputs for all four ceremonies
  - Create holiday date input with multi-select
  - Add reset button to restore defaults
  - Implement default value population
  - _Requirements: 2.1, 2.3, 3.1, 3.4, 3.5, 7.1_

- [ ] 7.2 Implement real-time validation and error display
  - Connect validation functions to form inputs
  - Display inline error messages below fields
  - Clear errors when input becomes valid
  - Disable submit/preview buttons when validation fails
  - Enable buttons when all validations pass
  - _Requirements: 2.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7.3 Write property test for invalid input error display
  - **Property 4: Invalid Input Shows Error Message**
  - **Validates: Requirements 2.5**

- [ ] 7.4 Write property test for validation success clears errors
  - **Property 17: Validation Success Clears Errors**
  - **Validates: Requirements 6.3**

- [ ] 7.5 Write property test for empty fields prevent submission
  - **Property 18: Empty Required Fields Prevent Submission**
  - **Validates: Requirements 6.4**

- [ ] 7.6 Write property test for valid config enables buttons
  - **Property 19: Valid Configuration Enables Buttons**
  - **Validates: Requirements 6.5**

- [ ] 8. Build ceremony preview component
- [ ] 8.1 Create preview display UI
  - Implement ceremony list display with type, date, time, duration
  - Add chronological sorting of ceremonies
  - Group ceremonies by sprint
  - Highlight conflicting ceremonies
  - Add loading state during generation
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8.2 Connect preview to form state
  - Implement automatic preview update on form changes
  - Debounce preview updates for performance
  - Handle empty state (no ceremonies)
  - _Requirements: 4.5_

- [ ] 8.3 Write property test for preview shows all ceremonies
  - **Property 7: Preview Shows All Ceremonies**
  - **Validates: Requirements 4.1**

- [ ] 8.4 Write property test for preview required information
  - **Property 8: Preview Contains Required Information**
  - **Validates: Requirements 4.2**

- [ ] 8.5 Write property test for preview chronological ordering
  - **Property 9: Preview Chronological Ordering**
  - **Validates: Requirements 4.3**

- [ ] 8.6 Write property test for conflicts highlighted
  - **Property 10: Conflicts Highlighted in Preview**
  - **Validates: Requirements 4.4**

- [ ] 8.7 Write property test for form changes update preview
  - **Property 11: Form Changes Update Preview**
  - **Validates: Requirements 4.5**

- [ ] 9. Build download component
- [ ] 9.1 Create download button and functionality
  - Implement download button with disabled state
  - Connect to iCalendar export function
  - Trigger browser download on click
  - Display success message after download
  - Handle download errors gracefully
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 9.2 Write property test for download generates valid iCalendar
  - **Property 12: Download Generates Valid iCalendar**
  - **Validates: Requirements 5.1**

- [ ] 10. Add help text and documentation
- [ ] 10.1 Create introduction and help content
  - Add page introduction explaining scheduler purpose
  - Add tooltips to form field labels
  - Add example values as placeholders
  - Add actionable guidance to error messages
  - Add link to detailed documentation
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10.2 Write property test for error messages include guidance
  - **Property 23: Error Messages Include Guidance**
  - **Validates: Requirements 8.4**

- [ ] 11. Implement offline support with service worker
- [ ] 11.1 Create and register service worker
  - Set up service worker with Workbox
  - Implement cache-first strategy for static assets
  - Register service worker on app initialization
  - Add offline status indicator
  - Handle service worker registration errors
  - _Requirements: 9.1, 9.4, 9.5_

- [ ] 11.2 Write property test for offline operation
  - **Property 24: Offline Operation Functionality**
  - **Validates: Requirements 9.2**

- [ ] 12. Integrate all components in main App
- [ ] 12.1 Create App component with state management
  - Set up React state for configuration and ceremonies
  - Connect form, preview, and download components
  - Implement configuration save/load UI
  - Add error boundary for graceful error handling
  - Add responsive layout with Tailwind CSS
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 12.2 Add configuration management UI
  - Create save configuration dialog
  - Create load configuration dropdown
  - Implement configuration naming
  - Add delete configuration functionality
  - _Requirements: 10.1, 10.3, 10.5_

- [ ] 13. Style application with Tailwind CSS
  - Apply responsive design for mobile and desktop
  - Style form inputs with consistent appearance
  - Style error messages with clear visibility
  - Style preview with readable formatting
  - Add loading states and transitions
  - Ensure accessibility (ARIA labels, keyboard navigation)
  - _Requirements: 1.1, 1.4_

- [ ] 14. Write unit tests for components
  - Test form rendering with all required fields
  - Test default value population
  - Test reset button functionality
  - Test download button disabled state
  - Test success message display
  - Test tooltip display
  - Test service worker registration
  - _Requirements: All_

- [ ] 15. Set up deployment configuration
  - Create Vite production build configuration
  - Configure build output directory
  - Add deployment instructions to README
  - Create vercel.json or netlify.toml for deployment
  - Test production build locally
  - _Requirements: All_

- [ ] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
