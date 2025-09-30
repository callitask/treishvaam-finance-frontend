# Framework & Tooling Detection

## Summary

- Framework: **React** (React 18.x) — app uses React and `react-dom`.
- Tooling: **Create React App** (uses `react-scripts` in scripts). TailwindCSS and PostCSS are present for styling.
- Entry file: `src/index.js` (creates root using `ReactDOM.createRoot` and renders `<App />`).
- Package manager: **npm** (package-lock.json present).
- Node engine: Not specified in `package.json` engines field. Recommended Node: 18.x or 20.x (CRA 5 works with Node >= 14.17.0 but use LTS).

## Key dependency versions (from package.json)

- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.6.2
- react-scripts: ^5.0.1 (Create React App)
- tailwindcss: ^3.4.3
- typescript: not present
- redux / vuex: not present

## Detected config files

- `tailwind.config.js` — Tailwind present
- `postcss.config.js` — PostCSS configured
- No `vite.config.js`, `webpack.config.js` or `angular.json` found. This indicates the project uses CRA (`react-scripts`) rather than custom Webpack or Vite configs.

## Entry points / important files

- Main JS entry: `src/index.js` — mounts React app to `document.getElementById('root')` and wraps App with `Router`, `AuthProvider`, and `HelmetProvider`.
- App component: `src/App.js` — the top-level React component (routing likely defined here).

## Package manager

- Found `package-lock.json` → npm is the package manager in use.

## Environment files / secrets check

- Found `.env` with entries:

  - REACT_APP_API_URL=http://localhost:8080
  - NEXT_PUBLIC_API_BASE_URL=https://backend.treishvaamgroup.com/api

- These look like environment variables. They do not contain high-entropy secrets, but they reference an external backend domain. If any real API keys are found in other env files, remove them and rotate secrets. TODO: rotate secret if any private keys are discovered.

## Assumptions

- Assumed toolchain: Create React App (CRA) because of the presence of `react-scripts` in `package.json` scripts and absence of other bundler config files.
- Assumed Node version: not declared — recommend Node 18 LTS for local development.
- If you plan to migrate to Vite or custom Webpack, additional config files will be required (e.g., `vite.config.js` or `webpack.config.js`).

---

For more details, see `package.json` and `src/index.js`.
