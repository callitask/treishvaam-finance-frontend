# Component: ShareButtons
**Path:** src/components/ShareButtons.js

**Purpose:** Renders social share buttons and handles share actions (copy link, open share dialogs).

## Props
- url, title, via

## Local State
- `copied` — shows temporary UI when link is copied

## Lifecycle / Hooks
- None complex

## API Calls
- None (uses Web Share API or window.open)

## Dependencies
- `react-icons` for button icons

## Styling
- Tailwind utility classes; responsive button layout

## Tests
- TODO: unit tests for copy behavior and fallback behavior

## Accessibility
- Buttons should have descriptive labels (aria-label)

## TODO / Suggested Improvements
- Use navigator.share when available and gracefully fallback
