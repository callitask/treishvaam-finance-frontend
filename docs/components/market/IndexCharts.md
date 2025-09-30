# Component: IndexCharts
**Path:** src/components/market/IndexCharts.js

**Purpose:** Wrapper for rendering market index charts (uses Chart.js) with multiple datasets.

## Props
- dataSets: array — chart datasets

## Local State
- chartRef and local chart instance state

## Lifecycle / Hooks
- `useEffect` to initialize Chart.js and update on data change

## API Calls
- None (consumes data via props or higher-level fetch)

## Dependencies
- `chart.js` and react-chart wrappers

## Styling
- Canvas sizing via Tailwind or inline styles

## Tests
- TODO: snapshot tests for chart configuration

## Accessibility
- Provide textual summaries / aria-hidden for decorative canvas

## TODO / Suggested Improvements
- Add responsive resizing and maintain aspect ratio
