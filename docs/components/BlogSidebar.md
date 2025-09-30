# Component: BlogSidebar
**Path:** src/components/BlogSidebar.js

**Purpose:** Sidebar shown on blog listing and article pages (related posts, categories, widgets).

## Props
- TODO: possible props: relatedPosts, categories, showNewsletter

## Local State
- `isExpanded` / filters — UI toggles for collapsible sections

## Lifecycle / Hooks
- `useEffect` to fetch sidebar widgets or subscribe to events

## API Calls
- May fetch recent posts or recommended items via `apiConfig.js`

## Dependencies
- `SearchAutocomplete`, `ShareButtons` or other small widgets

## Styling
- Tailwind utility classes; responsive hidden-on-mobile behavior

## Tests
- TODO: add snapshot/unit tests for presence of expected widgets

## Accessibility
- Ensure landmark roles and skip-links if content is long

## TODO / Suggested Improvements
- Consider lazy-loading non-critical widgets to speed initial article render
