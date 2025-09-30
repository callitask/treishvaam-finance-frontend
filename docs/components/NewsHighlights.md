# Component: NewsHighlights
**Path:** src/components/NewsHighlights.js

**Purpose:** Shows a short list/carousel of breaking or highlighted news items.

## Props
- items: array — news items

## Local State
- currentIndex for carousel, autoplay state

## Lifecycle / Hooks
- `useEffect` to handle autoplay timers or visibility toggles

## API Calls
- May fetch latest headlines via `apiConfig.js`

## Dependencies
- Carousel library or simple custom logic

## Styling
- Tailwind utilities and typography classes

## Tests
- TODO: add unit tests for list rendering and interaction

## Accessibility
- Ensure carousel uses ARIA roles and pause on hover/focus

## TODO / Suggested Improvements
- Ensure items have descriptive links and prefetch targets
