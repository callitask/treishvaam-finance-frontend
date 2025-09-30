# Component: DevelopmentNotice
**Path:** src/components/DevelopmentNotice.js

**Purpose:** Banner or badge displayed in development environments to notify users/developers.

## Props
- message?: string — override message text

## Local State
- None expected

## Lifecycle / Hooks
- Reads environment variable to decide whether to render (process.env.NODE_ENV)

## API Calls
- None

## Dependencies
- None

## Styling
- Tailwind CSS; high-contrast banner styles

## Tests
- TODO: add snapshot tests for dev vs production rendering

## Accessibility
- Should be dismissible and reachable by keyboard if interactive

## TODO / Suggested Improvements
- Respect a cookie/localStorage dismiss preference so dev notice can be hidden
