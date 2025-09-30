# Component: SearchAutocomplete
**Path:** src/components/SearchAutocomplete.js

**Purpose:** Search input with live suggestions and keyboard navigation.

## Props
- onSelect(item), placeholder, debounceMs

## Local State
- `query`, `suggestions`, `activeIndex`, `isOpen`

## Lifecycle / Hooks
- `useEffect` to fetch suggestions as query changes (debounced)

## API Calls
- Calls search suggestions endpoint (via `apiConfig.js`) — check source for exact path

## Dependencies
- `apiConfig.js`, debounce/throttle utilities

## Styling
- Tailwind classes; suggestion list positioned under input

## Tests
- TODO: keyboard navigation tests (ArrowUp/Down, Enter, Esc)

## Accessibility
- Proper ARIA attributes (role="combobox", aria-activedescendant) recommended

## TODO / Suggested Improvements
- Add highlight of matched substring and limit suggestions for perf
