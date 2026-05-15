# ROO CODE — TREISHVAAM FINANCE PROJECT RULES (v3)
# Roo reads this automatically at session start. These rules are always active.
# Last updated: 2026-05-15 — upgraded to v3 with new bug findings and task queue.

---

## FIRST ACTION EVERY SESSION (NON-NEGOTIABLE ORDER)
1. Read `CLAUDE.md` completely (master instruction + architecture)
2. Read `CLAUDE_SESSION_START.md` and execute the verification scan
3. Read `TODO.md` for current task queue
4. Check for `HANDOVER_DOCUMENT.md` in project root — if found, read it

Do NOT touch any code before completing all 4 steps.

---

## FINANCE FRONTEND — ARCHITECTURE (READ EVERY SESSION)

This project is mid-migration from CRA → Next.js 14 App Router:
- **Routes live in**: `app/` directory (`.tsx` files only)
- **`src/pages/*.js`** = NOT URL routes — imported as components by `app/` pages
- **`next.config.mjs`**: `pageExtensions: ['tsx', 'ts']` enforces this
- **Worker**: `worker/worker.js` = Cloudflare Worker (tenant header + SEO + SPA routing)
- **Backend**: `F:\BACKEND PROJECG\finance-api\finance-api` (Spring Boot 3.4, Java 21)

### Path Map (Always refer to this before touching files)
| URL | App Route | Component |
|-----|-----------|-----------|
| `/` | `app/page.tsx` | Landing page (self-contained) |
| `/home` | `app/home/page.tsx` | Wraps `src/pages/BlogPage.js` |
| `/category/[cat]/[slug]/[id]` | `app/category/.../page.tsx` | Wraps `src/pages/SinglePostPage.js` |
| `/dashboard/blog/new` | `app/dashboard/blog/new/page.tsx` | Wraps `src/pages/BlogEditorPage.js` |
| `/dashboard/blog/edit/[slug]/[id]` | `app/dashboard/blog/edit/.../page.tsx` | Wraps `src/pages/BlogEditorPage.js` |
| `/login` | `app/login/page.tsx` | Wraps `src/pages/LoginPage.js` |

### Backend Paths (on user's machine)
| What | Path |
|------|------|
| Frontend repo | `C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend` |
| Backend repo | `F:\BACKEND PROJECG\finance-api\finance-api` |
| Worker | `worker/worker.js` inside frontend repo |

---

## BRANCH PROTECTION (NON-NEGOTIABLE)
- NEVER commit or push to `main` branch directly
- ALWAYS create `claude/[feature-name]` branch for each task
- ALWAYS provide git commands but tell user to run them manually
- NEVER auto-run: `git push`, `git merge`, `git checkout main`, `wrangler deploy`

---

## FILE IGNORE LIST (Never read, never modify)
- `node_modules/**`
- `.next/**`
- `target/**`
- `*.lock` (package-lock, yarn.lock, pom.lock)
- `public/images/**`
- `.git/**`
- `RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/**` ← Read-only reference

---

## AUTO-APPROVE (No confirmation needed from user)
- Reading any file
- Creating files on a `claude/*` branch
- `npm run build`, `npm run lint`, `npm test`
- `mvn test`, `mvn spotless:apply`, `mvn compile`
- `npm install`

## ALWAYS ASK BEFORE (Requires explicit "APPROVED" from user)
- Any `git push` command
- Any `git merge`
- Any `git checkout main` or `production-deploy`
- Any SSH command to Ubuntu VM
- Any `docker` or `docker compose` command
- Any `wrangler deploy` or `npx wrangler deploy`
- Any database migration, ALTER TABLE, or schema change

---

## BACKEND EDIT RULE (CRITICAL)
Backend files live in `F:\BACKEND PROJECG\finance-api\finance-api` on user's machine.
Claude CANNOT directly save backend files — output them for the user to paste.

When editing ANY backend file:
1. Always output the COMPLETE file — never snippets or `// rest unchanged`
2. Prefix the file with this exact header:
```
═══════════════════════════════════════════════════════════
BACKEND FILE EDITED — ACTION REQUIRED BY USER
═══════════════════════════════════════════════════════════
File: src/main/java/com/treishvaam/financeapi/[path]/[File].java
Full path: F:\BACKEND PROJECG\finance-api\finance-api\src\...\[File].java
Action: Open in Eclipse/VS Code → Replace ENTIRE content → Save
Git: cd "F:\BACKEND PROJECG\finance-api\finance-api" && git add . && git commit -m "[msg]" && git push origin develop
═══════════════════════════════════════════════════════════
```

---

## NGINX / INFRA EDIT RULE
Nginx config lives on Ubuntu VM at `/etc/nginx/conf.d/default.conf` and is mirrored locally in
`F:\BACKEND PROJECG\finance-api\finance-api\nginx\conf.d\default.conf`.

When editing nginx:
1. Output the complete file with the header above
2. Tell user to SSH to Ubuntu VM and replace the file
3. Provide: `sudo nginx -t && sudo nginx -s reload` as the apply command

---

## OUTPUT FORMAT RULES
- Always state what was found before stating what will be changed
- Always list every file modified with its full path
- Never use `...` or `// rest unchanged` — output COMPLETE files
- Always provide the exact verification command after every change
- Git commands end with: `🟡 READY — Please run the git commands above to deploy`

---

## SENSITIVE DATA RULES (ABSOLUTE)
- NEVER hardcode API keys, secrets, tokens, passwords in any file
- NEVER commit `.env` files
- All secrets → Infisical / Cloudflare environment variables / `.env` (local only)
- GA4 measurement ID must come from `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var only

---

## GA4 STANDING INSTRUCTION (NEW IN V3)
GA4 must collect data automatically without any consent banner or gate.
- The current `app/layout.tsx` GA4 implementation is correct — do NOT add any consent check
- Do NOT add `gtag('consent', 'update', ...)` calls
- Do NOT wrap GA4 scripts in any cookie consent condition
- GA4 fires on page load unconditionally — this is the user's explicit business decision

---

## PUBLIC PAGES RULE (NEW IN V3)
These pages MUST work for unauthenticated visitors (no login redirect):
- `/` (landing page)
- `/home` (blog feed)
- `/category/[cat]/[slug]/[id]` (single post)
- `/privacy`, `/terms`, `/about`, `/contact`, `/vision`

If ANY component on these pages tries to redirect unauthenticated users to `/login`,
that auth guard MUST be removed from these specific pages.
The dashboard (`/dashboard/**`) is the ONLY section that requires auth.

---

## IMMUTABLE CHANGE HISTORY OF THIS FILE
- 2026-05-14 CREATED (v2): Initial Roo rules for finance frontend.
- 2026-05-15 UPDATED (v3): Added path map, GA4 standing instruction, public pages rule,
  backend/nginx edit rule headers, new bug findings for hydration errors and 403 on draft endpoint.
  Updated by: Claude Sonnet 4.6 on behalf of Treishvaam Group.