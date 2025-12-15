# Lightweight React Template for KAVIA

This project provides a minimal React app extended for a Freelancer Time Tracking UI.

## Key Features Added

- Sidebar navigation with routes:
  - Dashboard (/): analytics (daily/weekly/monthly) with charts
  - Projects: list/create/edit/delete
  - Tasks: list/create/edit/delete
  - Sessions: CRUD, start/stop, manual add, billable flag, hourly rate
  - Reports: trigger PDF export (opens new tab)
- API client configured for FastAPI backend (defaults to http://localhost:3001)
- Light theme with accents #3b82f6 and #06b6d4
- Loading and error states

## Configuration

- Create a `.env` file and set:
  ```
  REACT_APP_API_BASE_URL=http://localhost:3001
  ```
  If omitted, the app defaults to `http://localhost:3001`.

## Scripts

- `npm start` - Start dev server at http://localhost:3000
- `npm run build` - Production build
- `npm test` - Tests (template)

Learn more about React at the [React documentation](https://reactjs.org/).
