# Component: IndianMarketWidget
**Path:** src/components/market/IndianMarketWidget.js

**Purpose:** Compact widget showing Indian market indices and quick stats.

## Props
- config, refreshInterval

## Local State
- `data`, `isLoading`

## Lifecycle / Hooks
- `useEffect` to poll market endpoints and update UI

## API Calls
- Market endpoints via `apiConfig.js`

## Dependencies
- Chart components or small sparkline utilities

## Styling
- Tailwind utilities with responsive layout

## Tests
- TODO: integration tests mocking market API

## Accessibility
- Provide textual labels for index values and change direction

## TODO / Suggested Improvements
- Add caching and backoff on failures
