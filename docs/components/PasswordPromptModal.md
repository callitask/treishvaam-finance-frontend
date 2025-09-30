# Component: PasswordPromptModal
**Path:** src/components/PasswordPromptModal.js

**Purpose:** Modal dialog to request a password (used for gated content or admin flows).

## Props
- onConfirm(password), onCancel

## Local State
- `password`, `error`, `isSubmitting`

## Lifecycle / Hooks
- focus trap on open (useEffect to focus input)

## API Calls
- May validate password against an endpoint or call provided handler

## Dependencies
- Modal wrapper component and form utilities

## Styling
- Tailwind modal classes; overlay and center panel

## Tests
- TODO: accessibility tests for focus trap and keyboard handling

## Accessibility
- Use role="dialog", aria-modal, and ensure escape key closes modal

## TODO / Suggested Improvements
- Add rate-limiting indicator for repeated failed attempts
