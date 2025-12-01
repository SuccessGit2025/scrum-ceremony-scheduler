# Scrum Ceremony Scheduler - Web Interface

A simple, single-page web application for generating Scrum ceremony calendars. No installation required - just open in your browser!

## Features

- ✅ Generate ceremonies for multiple sprints
- ✅ Customize ceremony times and durations
- ✅ Support for holidays
- ✅ Real-time validation
- ✅ Live preview of schedule
- ✅ Download as .ics file for calendar import
- ✅ Responsive design (works on mobile)
- ✅ No backend required - runs entirely in browser

## Usage

### Option 1: Open Locally

1. Open `index.html` in your web browser
2. Configure your sprint parameters
3. Click "Preview" to see the schedule
4. Click "Download .ics" to get your calendar file

### Option 2: Deploy to GitHub Pages

1. Push the `web` folder to your GitHub repository
2. Go to Settings → Pages
3. Select the branch and `/web` folder
4. Your app will be available at `https://yourusername.github.io/repo-name/`

### Option 3: Deploy to Netlify/Vercel

1. Drag and drop the `web` folder to Netlify or Vercel
2. Your app will be deployed instantly with a public URL

## Configuration Options

- **Year**: 2020-2100
- **Sprint Duration**: 2 or 3 weeks
- **Number of Sprints**: 1-24
- **Ceremony Times**: Customizable for each ceremony type
- **Holidays**: Comma-separated dates in YYYY-MM-DD format

## Default Ceremony Settings

- **Sprint Planning**: 10:00 AM, 120 minutes
- **Daily Standup**: 9:30 AM, 15 minutes (weekdays only)
- **Sprint Review**: 2:00 PM, 60 minutes
- **Sprint Retrospective**: 3:00 PM, 45 minutes

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Privacy

All processing happens in your browser. No data is sent to any server.
