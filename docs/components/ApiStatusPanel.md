# Component: ApiStatusPanel
**Path:** src/components/ApiStatusPanel.js

**Purpose:** Composite panel aggregating multiple API checks and rendering `ApiStatusBlock` children.

## Props
- TODO: inspect for props (likely filters, autoRefresh)

## Local State
- `isLoading`: boolean — panel-level loading
- `results`: array — status results from API

## Lifecycle / Hooks
- `useEffect` — load or refresh API statuses on mount/interval

## API Calls
- Calls health/status endpoints (see `apiConfig.js`) — method and endpoints in source

## Dependencies
- `ApiStatusBlock` child component
- `apiConfig.js` or axios wrapper

## Styling
- Tailwind utilities; may include responsive grid/list layout

## Tests
- TODO: add integration tests that mock API responses

## Accessibility
- Use semantic lists or tables for multiple statuses and ARIA region for updates

## TODO / Suggested Improvements
- Add configurable refresh interval and pause on tab hidden
