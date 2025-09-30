## Environment variables & configuration

I scanned the repo for env files and runtime usages (files inspected: `.env`, `src/config.js`, `src/components/market/IndianMarketWidget.js`, `src/pages/DashboardPage.js`, `src/apiConfig.js`). This document lists the environment variables the app reads, their purpose, example values, and where they're used.

---

Summary of discovered variables

- REACT_APP_API_URL
  - Purpose: Primary API base URL used by `src/config.js` as the app's default backend URL.
  - Example: `http://localhost:8080`
  - Where used: `src/config.js` (const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080') and referenced in docs / quick-start.

- REACT_APP_API_BASE_URL
  - Purpose: An alternative API base used at runtime in some pages (falls back to the production backend domain when not set).
  - Example: `https://backend.treishvaamgroup.com`
  - Where used: `src/pages/DashboardPage.js` (used to construct the LinkedIn connect URL).

- REACT_APP_ALPHA_VANTAGE_API_KEY
  - Purpose: API key for Alpha Vantage (external market data service) used by the `IndianMarketWidget` component.
  - Example: `YOUR_ALPHA_VANTAGE_API_KEY`
  - Where used: `src/components/market/IndianMarketWidget.js` (reads `process.env.REACT_APP_ALPHA_VANTAGE_API_KEY`).

- NEXT_PUBLIC_API_BASE_URL
  - Purpose: Present in `.env` (likely copied from another project or intended for Next/Vercel deployments). Variables prefixed with `NEXT_PUBLIC_` are used by Next.js; in this Create React App project this variable is not actively referenced in source code but is included in the repo's `.env`.
  - Example: `https://backend.treishvaamgroup.com/api`
  - Where used: currently no direct uses in `src/` (present in repository `.env`).

- NODE_ENV
  - Purpose: Standard Node/React build mode (`development` | `production`). Many libraries and in-code checks use `process.env.NODE_ENV` to switch behavior.
  - Example: `development`
  - Where used: implicitly across the app and build scripts; components and libs often check `process.env.NODE_ENV`.

Notes about prefixes and CRA:
- Create React App only exposes env variables that start with `REACT_APP_` to the browser. Do not expect non-prefixed vars to appear in client code.
- If you migrate to Vite later, the convention changes to `VITE_`.

---

Where to set env values (recommended files)

- Local development
  - `.env.local` — per-developer overrides, not committed.
  - `.env.development.local` — environment-specific local overrides.
  - `.env` — repository example or defaults (this project currently includes a `.env` file but `.env` is in `.gitignore`).

- CI / Staging / Production
  - Set environment variables in the hosting platform (Netlify/Vercel/GH Actions/Azure etc.) or your CI pipeline. Do not commit secrets.

Examples (.env.example)
- A template file is provided at the project root as `.env.example` and also copied to `docs/.env.example`. Use it to create your own `.env.local` or `.env`.

---

How to override env variables when running locally

- PowerShell (temporary for current terminal session):

```powershell
$Env:REACT_APP_API_URL = 'http://localhost:8080'
$Env:REACT_APP_ALPHA_VANTAGE_API_KEY = 'your_alpha_key_here'
npm start
```

- Create React App: preferred approach is to create `.env.local` in project root with the variables you need.

How to override env variables in VS Code debug configurations

- Add an `env` block to your `.vscode/launch.json` configuration used to launch the dev server or attach a debugger. Example snippet:

```json
// .vscode/launch.json (snippet)
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch CRA",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "preLaunchTask": "npm: start",
      "env": {
        "REACT_APP_API_URL": "http://localhost:8080",
        "REACT_APP_ALPHA_VANTAGE_API_KEY": "your_alpha_key_here"
      }
    }
  ]
}
```

Or use the `envFile` property to point to an env file (VS Code will read it):

```json
"envFile": "${workspaceFolder}/.env.local"
```

Security and best-practices

- Never commit secrets. The repo already lists `.env` and `.env.local` in `.gitignore`.
- If you accidentally commit an API key, rotate it immediately with the provider.
- Prefer platform-managed secrets for production (e.g., Vercel/Netlify/Heroku secret env settings).

---

If you want, I can also:
- Generate a small `docs/mocks/msw/` handler set from the `apiConfig.js` endpoints for local development with Mock Service Worker.
- Produce a Postman collection or OpenAPI sketch from the API mapping already created.
