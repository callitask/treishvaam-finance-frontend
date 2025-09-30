## Build & Deploy (production)

This project is a Create React App (CRA) frontend. Below are exact commands and deployment notes.

Build command and artifact path

- Build command (exact):

```powershell
npm run build
```

- Output (artifact) path: the `build/` directory at project root. The static site files (index.html, static/js, static/css, etc.) are placed in `build/`.

How to serve the built files locally

- Using `serve` (single command):

```powershell
npx serve -s build
```

- Or using a small Node static server (example):

```powershell
npm install -g serve
serve -s build
```

Run behind a reverse proxy (recommended for production): place `build/` behind Nginx, Apache, or a CDN and ensure SPA routing is served by `index.html` (fallback to index).

Dockerfile (multi-stage) — saved at `docs/docker-frontend.Dockerfile`

- Example multi-stage Dockerfile (optimized for static build):

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=build /app/build /usr/share/nginx/html
# Optional: copy a custom nginx.conf if you need SPA fallback rules
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

If your site must be served from a subpath (e.g., GitHub Pages)

- In CRA, set the `homepage` field in `package.json` to the full URL or subpath. Example for GitHub Pages:

```json
"homepage": "https://<username>.github.io/<repo-name>"
```

- For other bundlers (Vite) use `base` config.

Notes about routing & single-page apps

- When serving from a subpath or with a reverse proxy, make sure unknown routes are redirected to `index.html` so client-side routing can handle them.

If you want, I can also:

- Add the Dockerfile to the repository root (currently saved under `docs/` as requested). 
- Add an `nginx.conf` with SPA fallback and cache headers.
