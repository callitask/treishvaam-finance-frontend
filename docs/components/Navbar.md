# Component: Navbar
**Path:** src/components/Navbar.js

**Purpose:** One-line summary of what this component does.

## Props
- `propName`: type — description
- (If props are not declared or typed, leave TODO)

## Local State
- `isMobileMenuOpen`: boolean — whether mobile menu is open
- `logoSrc`: string — current logo source URL (fallback handling)
- `isLoginDropdownOpen`: boolean — login dropdown open state

## Lifecycle / Hooks
- `useState` — local UI state for menu and dropdowns
- `useNavigate` — used for navigation after logout
- `useAuth` (custom hook) — reads authentication state

## API Calls
- None directly in this component; it calls `logout()` from `useAuth` context.

## Dependencies
- `useAuth` from `src/context/AuthContext.js`
- `SearchAutocomplete` child component
- `react-router-dom` (`NavLink`, `Link`, `useNavigate`)
- `react-icons` for icons

## Styling
- TailwindCSS utility classes used inline in JSX (no separate CSS file referenced)

## Tests
- Unit test file(s): path
- E2E test file(s): path
- If none found: TODO: add tests

## Accessibility
- Uses semantic `<nav>` and `<header>` landmarks; mobile menu includes `sr-only` labels.
- Keyboard accessibility should be validated for dropdown and mobile menu toggles.

## TODO / Suggested Improvements
- Extract duplicated class logic for `getLinkClass` into a helper for readability.
- Ensure all interactive elements have focus styles and keyboard handlers for better accessibility.
