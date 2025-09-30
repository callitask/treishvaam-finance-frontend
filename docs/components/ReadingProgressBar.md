# Component: ReadingProgressBar
**Path:** src/components/ReadingProgressBar.js

**Purpose:** Visual indicator tracking scroll progress inside an article.

## Props
- targetSelector?: string — element selector to track (default article content)

## Local State
- `progress` (0-100)

## Lifecycle / Hooks
- `useEffect` attaches scroll listener and updates progress (throttle/debounce applied)

## API Calls
- None

## Dependencies
- throttle utility from `lodash` (if used)

## Styling
- Tailwind CSS; fixed position at top of viewport

## Tests
- TODO: unit tests for progress calculation logic

## Accessibility
- Provide text alternative or ARIA attribute to expose progress

## TODO / Suggested Improvements
- Use passive event listeners and avoid heavy calculations to improve perf
