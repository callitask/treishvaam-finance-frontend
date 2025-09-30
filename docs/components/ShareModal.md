# Component: ShareModal
**Path:** src/components/ShareModal.js

**Purpose:** Modal wrapper showing `ShareButtons` and additional sharing options.

## Props
- isOpen, onClose, url, title

## Local State
- none beyond modal open state

## Lifecycle / Hooks
- focus trap on open and restore focus on close

## API Calls
- None

## Dependencies
- `ShareButtons`, modal utilities

## Styling
- Tailwind modal styles

## Tests
- TODO: accessibility tests for focus management

## Accessibility
- role="dialog", aria-modal and keyboard handlers

## TODO / Suggested Improvements
- Provide copy link with visible confirmation and analytics hook
