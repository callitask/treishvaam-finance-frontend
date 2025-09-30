# Component: TableOfContents
**Path:** src/components/TableOfContents.js

**Purpose:** Auto-generated table of contents for article pages (extracts headings and creates anchor links).

## Props
- contentSelector?: string — selector to find headings

## Local State
- `headings` array with {id, text, level}

## Lifecycle / Hooks
- `useEffect` to scan DOM for headings on mount and on content change

## API Calls
- None

## Dependencies
- None; interacts with DOM and `SinglePostPage` for anchors

## Styling
- Tailwind CSS for nested lists and active item highlighting

## Tests
- TODO: unit test for heading extraction logic

## Accessibility
- Provide skip-links and ensure headings are focusable via anchors

## TODO / Suggested Improvements
- Support collapsing by heading level and active-section highlighting
