## Quick Start — Local Development (exact commands)

This project is a Create React App (CRA) application. The scripts are defined in `package.json`:

- start: `react-scripts start` (development server)
- build: `react-scripts build` (produce production-optimized build)
- test: `react-scripts test` (runs test runner)

Follow these steps to get running locally.

Prerequisites

- Node.js: recommended LTS (Node 18.x or Node 20.x).
- npm (bundled with Node). This repository uses npm (there is a `package-lock.json`).
- Optional: nvm for managing Node versions.

nvm snippet (Windows - nvm-windows example):

```powershell
# Install nvm-windows separately and then:
nvm install 18.20.0
nvm use 18.20.0
node -v
npm -v
```

Exact commands (copy-pasteable)

```powershell
# clone (if needed)
# git clone <repo-url>
cd C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend

# install dependencies
npm ci

# start dev server
npm start

# build production bundle
npm run build

# run tests (interactive)
npm test
```

Notes on environment variables / API base URL

- Create a file named `.env.local` (or `.env`) at the project root to set environment variables for local development.
- For Create React App, environment variables that should be exposed to the browser must start with `REACT_APP_`.
- Example `.env.local`:

```
REACT_APP_API_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=https://backend.treishvaamgroup.com/api
```

- After changing `.env.local`, restart the dev server to pick up changes.
- If you migrate to Vite in future, env files use `VITE_` prefix instead of `REACT_APP_`.

Port defaults and how to change them

- CRA dev server default port: 3000.
- To change the port on Windows PowerShell for the current command, run:

```powershell
$env:PORT=4000; npm start
```

- Or set the environment variable in `.env.local` (CRA supports `PORT` in some setups) or in your shell.

Build output

- Production build command: `npm run build` (runs `react-scripts build`).
- Build artifacts are written to the `build/` directory at the repository root. Serve `build/index.html` with any static server (e.g., serve, nginx).

Quick smoke tests

- Open the app in a browser: http://localhost:3000 (or the port you set).
- Verify an API-backed page (if backend is available at REACT_APP_API_URL):

```powershell
# Replace /api/status or a known endpoint with one your backend exposes
curl http://localhost:3000/api/health -v
```

- A quick smoke test for the rendered page using curl (fetch HTML):

```powershell
curl http://localhost:3000/ | Select-String -Pattern "<title>"
```

Troubleshooting notes

- If you see errors related to Node versions, install Node 18 and run `npm ci` again.
- If environment variables are not applied, ensure they start with `REACT_APP_` and restart the dev server.# Quick Start — Local Development

This document shows exact steps to run the frontend locally.

1) Required tools

- Node.js (recommended LTS): 18.x or 20.x
- npm (comes with Node). This repo uses npm (package-lock.json present).

2) Install dependencies

Open a terminal at the repository root and run:

```powershell
cd C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend
npm install
```

3) Environment example

Create a `.env.local` or use `.env` at project root. Example `.env.local`:

```
REACT_APP_API_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE_URL=https://backend.treishvaamgroup.com/api
```

Notes:
- Do not commit secrets. If you find API keys in `.env`, rotate them and add the file to `.gitignore`.

4) Start the dev server

```powershell
npm start
```

This runs `react-scripts start` and opens the app at http://localhost:3000 by default.

5) Build for production

```powershell
npm run build
```

Build output will be in the `build/` directory.

6) Run tests (if any)

```powershell
npm test
```

7) Useful troubleshooting

- If you hit a Node engine error, install Node 18 LTS and re-run `npm install`.
- If port 3000 is in use, run `set PORT=4000; npm start` on PowerShell.
