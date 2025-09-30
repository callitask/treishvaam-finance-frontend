## Tests & QA

I scanned the project for test frameworks. Findings:

- Test libraries present (from `package.json` / lockfile): Jest (via Create React App / `react-scripts`) and @testing-library family (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`).
- No explicit e2e frameworks (Cypress, Playwright, Puppeteer) were found in the repository.
- No test files (`*.test.js`, `*.spec.js`, or `__tests__` folders) were detected in `src/` during the scan.

Commands — exact (PowerShell / Windows)

- Install deps (clean):

```powershell
npm ci
```

- Run the test runner (watch mode / interactive):

```powershell
npm test
```

- Run tests once (CI-style) and disable watch mode:

```powershell
$env:CI = 'true'; npm test -- --watchAll=false
```

- Run coverage report (single-run):

```powershell
$env:CI = 'true'; npm test -- --coverage --watchAll=false
```

- Run a single test file (example):

```powershell
npx react-scripts test src/components/Navbar.test.js --watchAll=false
```

- Run tests matching a name/regex (example):

```powershell
npm test -- -t "renders header"
```

Where tests live

- Unit tests are usually colocated with source files under `src/` (filenames like `*.test.js`, `*.spec.js`, or `__tests__` directories). This project currently has testing libraries installed, but I didn't find test files under `src/` during the scan.
- E2E tests: no Cypress/Playwright directory or config detected.

Coverage & thresholds

- Running coverage (see command above) produces a `coverage/` folder at the repo root (standard Jest output).
- There is no coverageThreshold configured in the repository (no `jest` entry in `package.json` or `jest.config.js`). If you'd like to enforce thresholds add a `jest.config.js` (example below).

Example `jest.config.js` with coverage threshold (optional)

```javascript
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80
    }
  }
};
```

CI test step (example) — GitHub Actions snippet

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests (CI)
        run: npm test -- --coverage --watchAll=false
```

Run that locally (PowerShell)

```powershell
$env:CI = 'true'; npm ci; $env:CI = 'true'; npm test -- --coverage --watchAll=false
```

Test fixtures & mock servers

- This repository does not include a dedicated mock server or test fixtures directory. For HTTP mocking in unit/integration tests consider one of:
  - Mock Service Worker (MSW) — recommended for browser-like integration tests.
  - Jest manual mocks (mock axios) — for fast unit tests.

Suggested quick start for adding mocks (MSW)

1. Install `msw` and `msw/node` as dev dependencies.
2. Add a `mocks/` directory with handlers that mirror `src/apiConfig.js` endpoints.
3. Start MSW in test setup file (e.g., `src/setupTests.js`) for all tests.

Example minimal `src/setupTests.js` (CRA will pick this up):

```javascript
import '@testing-library/jest-dom';
// import { server } from '../mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());
```

If you'd like, I can scaffold a basic test (Jest + React Testing Library) for a small component and/or create an MSW mock set for the endpoints in `src/apiConfig.js`.
