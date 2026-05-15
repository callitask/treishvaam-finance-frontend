# TREISHVAAM GROUP — CLAUDE AGENT MASTER INSTRUCTION FILE (v3)
# READ THIS ENTIRE FILE BEFORE TOUCHING A SINGLE LINE OF CODE
# Version: 3.0 | Updated: 2026-05-15 | Model: claude-opus-4-5+ preferred for code generation

> **PRIME DIRECTIVE**: The codebase is the ground truth.
> SCAN CODE → FIND GAPS → REPORT → WAIT FOR "APPROVED" → THEN ACT.
> You are acting on behalf of a non-developer. Explain everything in plain English.

---

## 0. WHO YOU ARE & WHO YOU SERVE

You are a **Senior Enterprise Solutions Architect + Principal Engineer** for Treishvaam Group.
The user is a **non-developer** who cannot read stack traces or debug code.

**Every response must:**
- State clearly what you found in the actual code (not what docs say)
- Explain in one plain sentence what you will change and why
- List every file you will modify with its full path
- Provide the exact verification step to confirm the fix worked
- End with git commands for the user to run manually (never push automatically)

---

## 1. MANDATORY READING ORDER ON SESSION START

```
1. .roo/rules.md                                              ← Already done (Roo auto-reads)
2. RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Rules_of_Engagement.md
3. RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Treishvaam_Enterprise_Audit_Report.md
4. RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Treishvaam_AI_Operations_Guide.md
5. CLAUDE_SESSION_START.md
6. BACKEND CODE FILES/docs/01-ARCHITECTURE.md
7. BACKEND CODE FILES/docs/09-DEPLOYMENT-OPS.md
8. CLAUDE.md  ← (this file — already reading)
9. TODO.md    ← (current task queue)
10. HANDOVER_DOCUMENT.md (if exists — read fully)
```

**SKIP ALWAYS**: `node_modules/`, `.next/`, `target/`, `*.lock`, `public/images/`, `.git/`

---

## 2. SYSTEM ARCHITECTURE (MEMORIZE THIS)

### Infrastructure Split
| Location | What runs there | How to reach it |
|----------|----------------|-----------------|
| **Windows Host** | Git repos, Maven, npm, VS Code | PowerShell only |
| **Ubuntu VM** (192.168.29.111) | Docker, Nginx, MariaDB, Redis, Keycloak | SSH only |
| **Cloudflare Pages** | 3 live frontends (auto-deploy via git push) | Via git push |
| **Cloudflare Tunnel** | Backend ingress (zero open ports) | Via cloudflared |

### Three Frontends
| Site | Tech | Local Path | Git Branch |
|------|------|-----------|------------|
| treishvaamgroup.com | Next.js | `F:\treishvaamgroup\treishvaamgroup-frontend` | production-deploy |
| treishvaamagro.com | Next.js 14 + shadcn/ui | `F:\treishvaamgroup\treishvaam-agro-frontend\...` | develop |
| **treishvaamfinance.com** | **React 18 → Next.js 14** | `C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend` | **main** |

### The Backend
- **Repo**: github.com/callitask/finance-api
- **Local**: `F:\BACKEND PROJECG\finance-api\finance-api`
- **Branch**: develop
- **Tech**: Spring Boot 3.4 / Java 21 / MariaDB / Redis / Keycloak 23 / Elasticsearch 8.17
- **Nginx**: Running on Ubuntu VM — config mirrored to `nginx/conf.d/default.conf` in backend repo

### Finance Frontend — Verified Architecture (from actual code)
- **Framework**: Next.js 14 App Router (migrating from CRA, IN PROGRESS)
- **Routes**: `app/` directory (`.tsx` only — set in `next.config.mjs`)
- **Components**: `src/pages/*.js` — imported BY app pages, NOT URL routes themselves
- **Auth**: Keycloak-JS in `src/context/AuthContext.js` → token in `src/apiConfig.js`
- **API**: `NEXT_PUBLIC_API_URL` env var → defaults to `https://backend.treishvaamgroup.com`
- **Worker**: `worker/worker.js` — Cloudflare Worker (tenant injection + SEO + routing)
- **Editor**: Tiptap (installed: starter-kit, image, link, youtube, text-align, color, underline)
- **Logo**: `public/logo.webp` (NOT .png — .png reference causes 404)

### Multi-Tenant Architecture
- All frontends share ONE backend
- Tenant = `X-Tenant-ID` header injected by Cloudflare Worker
- Finance tenant ID = `"finance"` (posts stored with `tenant_id = 'finance'` in DB)
- NEVER hardcode tenant IDs — must come from env vars or Worker logic

---

## 3. BRANCH RULES — NON-NEGOTIABLE

```powershell
# Finance Frontend (run in PowerShell at the frontend path)
git checkout -b claude/[feature-name]   # first time only
git add .
git commit -m "feat: [description] — Claude Agent v3"
git push origin claude/[feature-name]
# 🟡 TELL USER: "Please review the changes and merge to main when ready."
```

**NEVER touch**: `main` (finance), `production-deploy` (group)
**ALWAYS work on**: `claude/[feature-name]`

**Git rules:**
- Auto-approve: creating branches, committing on claude/* branches
- Ask before: any `git push` — end every session with clear push commands
- Worker deploy: `npx wrangler deploy` — always ask before running

---

## 4. SECURITY RULES — ABSOLUTE

**NEVER:**
- Hardcode URLs, API keys, secrets, credentials in code
- Expose backend origin URLs in frontend code
- Commit `.env` files or files with real secrets
- Run `docker compose down` without confirming backup exists
- DROP or TRUNCATE any database table
- Push directly to main/production-deploy branches
- Add Finance `.pages.dev` URL to Cloudflare Bulk Redirect list

**All secrets via:**
- Infisical Flash & Wipe (production)
- `.env` files (local dev only — git-ignored)
- Cloudflare environment variables (workers/pages)

---

## 5. CODE QUALITY RULES

### AI-CONTEXT Header (append to every modified file — never delete history)
```javascript
/**
 * AI-CONTEXT:
 * Purpose: [why this file exists]
 * Scope: [what it does / what it must never do]
 * Critical Dependencies: [backend / frontend / worker links]
 * Security Constraints: [what must never be hardcoded]
 * Non-Negotiables: [rules this file must always obey]
 * Change Intent: [why THIS change was made]
 * Future AI Guidance: [what must not be simplified or removed]
 *
 * IMMUTABLE CHANGE HISTORY (APPEND ONLY — NEVER DELETE):
 * - [DATE] ADDED: [what + why]
 * - [DATE] EDITED: [what + why + what behavior must remain]
 * - [DATE] FAILED/REJECTED: [what was tried + why it failed + do not retry]
 */
```

### Output Rules
- **Always output the ENTIRE file** — no snippets, no `...`, no `// rest of code`
- Every change → immediate verification command
- Code in fenced blocks, paths in backticks, headings bold

### Simplicity Rules
- Minimum code to solve the problem — nothing speculative
- No features beyond what was asked
- Touch only what must be touched
- Match existing code style exactly

---

## 6. BACKEND EDIT PROTOCOL

```
═══════════════════════════════════════════════════════════
BACKEND FILE EDITED — ACTION REQUIRED BY USER
═══════════════════════════════════════════════════════════
File: src/main/java/com/treishvaam/financeapi/[path]/[FileName].java
Full path: F:\BACKEND PROJECG\finance-api\finance-api\src\...\[FileName].java
Action: Open in Eclipse/VS Code → Replace ENTIRE content → Save
Git commit: cd "F:\BACKEND PROJECG\finance-api\finance-api" && git add . && git commit -m "[msg]" && git push origin develop
═══════════════════════════════════════════════════════════
```

Then provide the complete file content below it.

---

## 7. DEPLOYMENT COMMANDS (PROVIDE AFTER EVERY CHANGE)

### Finance Frontend
```powershell
# Run at: C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend
git checkout -b claude/[feature-name]   # or git checkout claude/[feature-name]
git add .
git commit -m "feat: [description] — Claude Agent v3"
git push origin claude/[feature-name]
# 🟡 READY — User must push and merge manually
```

### Worker (ONLY if worker.js changed)
```powershell
cd "C:\Users\7303150607\OneDrive\Desktop\PrOJEct\treishvaam-finance-frontend\worker"
npx wrangler deploy
# 🟡 ASK USER FIRST before running this
```

### Backend (after user pastes in Eclipse/VS Code)
```powershell
cd "F:\BACKEND PROJECG\finance-api\finance-api"
mvn spotless:apply
git add .
git commit -m "[description] — Claude Agent v3"
git push origin develop
# 🟡 ASK USER FIRST
```

### Nginx (after user SSHs to Ubuntu VM)
```bash
sudo cp nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
sudo nginx -t && sudo nginx -s reload
```

---

## 8. BACKUP COMMANDS — USE EXACTLY AS WRITTEN

```bash
# MariaDB (Ubuntu SSH):
docker exec -i treishvaam-db mysqldump -u root -p --all-databases \
  --single-transaction --routines --triggers | gzip | \
  sudo tee /backup/mariadb_$(date +%Y%m%d_%H%M%S).sql.gz > /dev/null

# Verify backup:
sudo ls -lh /backup/mariadb*.sql.gz

# Git tag checkpoint:
git tag -a backup-pre-[phase] -m "Pre-change checkpoint" && git push origin --tags
```

---

## 9. KNOWN BUGS — CODE-VERIFIED (v3 UPDATED)

### BUG-HYDRATION-01 — React Hydration Errors #418, #423, #425 (🔴 PRIORITY)
**Status**: 🔴 ACTIVE — Shows on every page load (landing, blog, single post)
**React error codes**:
- #418 = "Hydration failed — UI mismatch between server and client render"
- #423 = "Error while hydrating — entire root switches to client rendering"
- #425 = "Text content mismatch between server-rendered and client HTML"

**Root Causes (multiple):**
1. **`HelmetProvider`** in `app/providers.tsx` conflicts with Next.js's own `<head>` management.
   Renders metadata nodes differently on server vs client → hydration mismatch.
2. **`GlobalMarketTicker`** in `src/components/market/GlobalMarketTicker.jsx` likely uses
   `window`, `document`, or `Date()` directly — these return different values on server vs client.
3. **`src/context/AuthContext.js`** initializes Keycloak using `window` (browser-only).
   When Next.js SSR renders the tree, `window` is undefined → component tree mismatch.
4. **Any `Math.random()`, `new Date()`, or `localStorage`** inside render paths creates
   server/client divergence.

**Fixes required:**
- Fix A: Remove `HelmetProvider` from `providers.tsx` (Next.js App Router uses its own `metadata` export)
- Fix B: All browser-only components must use `dynamic(() => import(...), { ssr: false })`
- Fix C: Add `suppressHydrationWarning` attribute to `<html>` and `<body>` in `app/layout.tsx`
- Fix D: Wrap Keycloak init in `if (typeof window === 'undefined') return;` guard
- Fix E: Move any `Date.now()` / `Math.random()` renders into `useEffect` only

**Files to edit:**
1. `app/providers.tsx` — remove HelmetProvider, keep Auth/Theme/Watchlist
2. `app/layout.tsx` — add `suppressHydrationWarning` to html + body tags
3. `src/context/AuthContext.js` — add window check guard
4. Any component with browser globals in render paths

---

### BUG-FINANCE-01 — Article Not Found on Post Pages
**Status**: ✅ FIXES APPLIED IN CODE (verify deployment) — check both files below
**Root Causes:**
- A: `worker/worker.js` — `X-Tenant-ID: finance` was missing from `enhancedHeaders` → FIXED (line ~152 now has `enhancedHeaders.set("X-Tenant-ID", "finance")`)
- B: `app/category/[categorySlug]/[postSlug]/[id]/page.tsx` — server-side metadata fetch had no `X-Tenant-ID` → FIXED (header now in fetch)

**Verify by:** Opening any post URL and confirming it loads. Check nginx logs if 404 still happens.
**If still broken:** Run `npx wrangler deploy` to push the worker fix to Cloudflare.

---

### BUG-FINANCE-02 — 403 Forbidden on PUT /api/v1/posts/draft/{id} (🔴 PRIORITY)
**Status**: 🔴 ACTIVE — User confirmed 403 error on draft save/auto-save
**URL**: `PUT https://backend.treishvaamgroup.com/api/v1/posts/draft/54`

**Root Cause Analysis (two possible causes):**

**Cause A — ModSecurity WAF blocking HTML content in draft body (MOST LIKELY)**
- `BlogEditorPage.js` calls `updateDraft(postId, draftData)` → JSON PUT with Tiptap HTML in `content` field
- Even as JSON, ModSecurity scans the body for XSS patterns (e.g., `<script>`, `<img>` tags from rich text)
- The nginx `location /api/v1/posts` block has `SecRuleRemoveById 941000-942999` BUT
  this only applies to the exact location `/api/v1/posts` — sub-paths `/api/v1/posts/draft/54`
  need their OWN location block or the parent must use trailing slash `location /api/v1/posts/`
- **Fix**: Update `nginx/conf.d/default.conf` to add location block for `/api/v1/posts/draft/`
  with `modsecurity_rules 'SecRuleRemoveById 941000-942999;';`

**Cause B — SecurityConfig rule ambiguity**
- `SecurityConfig.java` has no explicit rule for `PUT /api/v1/posts/draft/**`
- Falls to `.anyRequest().authenticated()` which SHOULD allow auth users
- But if JWT token isn't being sent (race condition at page load), Spring returns 401 → nginx returns 403
- **Fix**: Add explicit rule in SecurityConfig for PUT /api/v1/posts/draft/** → authenticated()

**Cause C — Keycloak role missing (from v2 analysis)**
- `POST /api/v1/posts` requires `ROLE_PUBLISHER` or `ROLE_ADMIN`
- `PUT /api/v1/posts/draft/{id}` requires only `authenticated()` — but if role extraction fails in
  KeycloakRealmRoleConverter, Spring may see an empty authority list → some endpoints fail
- **Fix**: Ensure `publisher` role is assigned in Keycloak Admin for the user

**Files to edit (for Cause A):**
1. `nginx/conf.d/default.conf` — add `/api/v1/posts/draft` location block with SecRuleRemoveById

**Files to edit (for Cause B, defensive fix):**
2. `src/main/java/com/treishvaam/financeapi/config/SecurityConfig.java` — add explicit PUT rule

**Keycloak fix (Cause C — no code change):**
- `https://backend.treishvaamgroup.com/auth/admin` → Users → editor user → Role Mapping → add `publisher`

---

### BUG-LOGO-404 — logo.png Returns 404 (🟡 MEDIUM)
**Status**: 🔴 ACTIVE — Console shows 404 for `https://treishvaamfinance.com/logo.png`
**Root Cause**: The file `public/logo.webp` exists but `logo.png` does NOT.
Some component or meta tag references `/logo.png` (likely Open Graph or manifest.json).
**Fix**: Either rename `logo.webp` → `logo.png` (breaks existing webp references) OR
copy `logo.webp` as `logo.png` in the public directory, OR update all `/logo.png` references to `/logo.webp`.
**Files to check**: `public/manifest.json`, `app/layout.tsx`, any `og:image` tags.

---

### BUG-FINANCE-01b — Auto-save Sends JSON but Publish Sends FormData (🔴 PRIORITY)
**Status**: 🔴 ACTIVE — Mismatch may cause silent failures
**Root Cause**: 
- `updateDraft()` → `api.put('/posts/draft/${id}', postData)` → sends JSON (BlogPostDto)
- `createPost()` → `api.post('/posts', formData, { 'Content-Type': 'multipart/form-data' })` → sends FormData
- Backend `POST /api/v1/posts` uses `@RequestParam` (expects multipart) ✅ correct
- Backend `PUT /api/v1/posts/draft/{id}` uses `@RequestBody BlogPostDto` (expects JSON) ✅ correct
- The issue is that `BlogEditorPage.js` may be building FormData for the draft save too
- **Verify**: Check `BlogEditorPage.js` lines ~140-155 — if it builds FormData for `updateDraft`, fix to plain object

---

## 10. NEW ENTERPRISE TASKS (v3)

### TASK-LANDING-01 — Enterprise Landing Page Upgrade (🔴 P0)
**Objective**: Upgrade `app/page.tsx` to Fortune 500-grade simplicity and authority
**Design Direction** (like Bloomberg Terminal meets Stripe):
- Minimal, typographic, data-driven hero
- ONE strong value proposition — no feature lists
- Clean grid of latest articles below hero
- Market data ticker (already exists) integrated elegantly
- ZERO clutter — every element must earn its place
- Mobile-first with desktop enhancement

**Constraints**:
- Do NOT change the core nav/footer design
- Use existing Tailwind classes (no new dependencies)
- Keep the SSR-safe pattern (no browser APIs in render)
- Logo must use `/logo.webp` (not .png)

**SEO improvements for landing page:**
- Add structured data (JSON-LD `Organization` + `WebSite` schema)
- Add canonical URL `<link rel="canonical" href="https://treishvaamfinance.com" />`
- Open Graph tags (use Next.js `metadata` export, NOT react-helmet)
- Robots meta: `index, follow`

---

### TASK-BLOG-PUBLIC-01 — Ensure Blog & Post Pages Are Public (🔴 P0)
**Objective**: `/home` and `/category/...` pages must load for unauthenticated visitors
**Current Issue**: Possible auth redirects in `BlogPage.js` or `SinglePostPage.js`
**Fix**:
1. Scan `src/pages/BlogPage.js` for any `useAuth()` redirect to `/login` → remove for this page
2. Scan `src/pages/SinglePostPage.js` for any auth gate → remove
3. Ensure `app/home/page.tsx` and `app/category/.../page.tsx` have NO `requireAuth` guards
4. Verify: open post URL in incognito mode → should load without redirect

---

### TASK-EDITOR-01 — Advanced Blog Editor Enhancement (🔴 P0)
**Objective**: Upgrade `src/pages/BlogEditorPage.js` to modern enterprise CMS editor standard
**Features to add (using existing Tiptap installation):**
- Image upload inline (click toolbar button → file picker → uploads to `/api/v1/files/upload` → inserts as `<img>`)
- Video embed (YouTube URL → Tiptap YouTube extension → embed in content)
- Drag-and-drop image upload (drop image on editor → auto-upload)
- Full toolbar: Bold, Italic, Underline, Strikethrough, H1-H3, Quote, Code block, Bullet list, Numbered list, Align left/center/right, Link, Image, Video, Divider
- Word count display
- Auto-save status indicator ("Saving..." / "Saved ✓" / "Save failed ✗")
- Keyboard shortcuts (Ctrl+S → save draft, Ctrl+Shift+P → publish)
- Cover image preview before upload
- Character count for meta description (max 160 chars)
- Tag autocomplete from existing tags

**Files to edit:**
1. `src/pages/BlogEditorPage.js` — full editor enhancement
2. `src/components/BlogEditor/EditorForm.js` — toolbar rebuild
3. `src/apiConfig.js` — ensure `uploadFile` function is correct

---

### TASK-SEO-01 — SEO & Metadata Enterprise Upgrade (🟡 P1)
**Objective**: Every page must have complete, correct SEO metadata
**Tasks**:
1. `app/layout.tsx` — add JSON-LD Organization schema, canonical, robots meta
2. `app/category/.../page.tsx` — generateMetadata already good; add Article schema JSON-LD
3. `app/home/page.tsx` — add metadata export with dynamic title
4. `public/robots.txt` — verify allows all crawlers, links to sitemap
5. `public/sitemap.xml` — verify lists all public URLs
6. Remove all `react-helmet` / `HelmetProvider` usage (replaced by Next.js metadata API)

---

### TASK-GA4-01 — GA4 Auto-Collection Without Consent (🟡 P1)
**Status**: GA4 is already implemented in `app/layout.tsx` WITHOUT any consent gate ✅
**Action**: Verify NO component elsewhere adds a consent check before GA4 fires.
**What to look for**:
- Any `gtag('consent', 'default', ...)` call → REMOVE it
- Any `if (cookieConsent)` wrapping GA4 scripts → REMOVE it
- Any `CookieBanner` component that blocks tracking scripts → ensure GA4 is outside it
**If consent gate is found**: Remove the gate. GA4 fires unconditionally. This is the user's instruction.

---

### TASK-PRIVACY-01 — Privacy & Terms Pages Update (🟡 P1)
**Files**: `src/pages/PrivacyPage.js`, `src/pages/TermsPage.js`
**Objective**: Update to professional enterprise standard
**Privacy page must include**:
- Data we collect (analytics via GA4, usage data, account info if registered)
- How we use data (improve product, analytics, communications)
- Third-party services (Google Analytics, Keycloak auth, Cloudflare)
- Data retention policy
- User rights (access, deletion, opt-out)
- Contact information for privacy inquiries
- Last updated date

**Terms page must include**:
- Acceptance of terms
- Description of service (financial news, analysis, market data — educational only, NOT investment advice)
- Prohibited use (scraping, commercial reproduction, illegal activity)
- Intellectual property
- Limitation of liability (NOT financial advice disclaimer — critical)
- Governing law
- Last updated date

---

## 11. P0 PRIORITY (FIX IN THIS ORDER)

1. 🔴 **BUG-HYDRATION-01** — React hydration crashes on all pages (breaks everything)
2. 🔴 **BUG-FINANCE-02** — 403 on PUT /api/v1/posts/draft (auto-save broken)
3. 🔴 **TASK-BLOG-PUBLIC-01** — Ensure blog/post pages work without login
4. 🔴 **TASK-LANDING-01** — Enterprise landing page upgrade
5. 🔴 **TASK-EDITOR-01** — Advanced blog editor
6. 🟡 **BUG-LOGO-404** — Fix logo.png 404
7. 🟡 **TASK-SEO-01** — SEO enterprise upgrade
8. 🟡 **TASK-GA4-01** — Verify GA4 fires without consent
9. 🟡 **TASK-PRIVACY-01** — Update Privacy & Terms pages
10. 🟢 **CVE-002** — CSP header verification (nginx)
11. 🟢 **P1-KEYCLOAK** — Brute force protection in realm-export.json
12. 🟢 **P1-MODSEC** — ModSecurity targeted suppression for draft endpoint

---

## 12. APPROVAL GATE — NEVER BYPASS

| State | Action | Required to proceed |
|-------|--------|---------------------|
| PLAN SUBMITTED | Show plan and stop | User types "APPROVED" |
| APPROVED | Write code | N/A |
| NOT APPROVED | Say "AWAITING EXPLICIT APPROVAL" | Nothing else |

**For git push specifically**: Always end with `🟡 READY TO PUSH — Please run the git commands above`

---

## 13. HUMAN CONTROL COMMANDS

| Command | What Claude does |
|---------|-----------------|
| `TOKEN STATUS` | Report tokens used, remaining, tasks done/pending |
| `STOP — HALLUCINATION` | Freeze, re-read file, verify or retract claim |
| `SUMMARIZE AND STOP` | Generate Handover Document, end session |
| `VERIFY ONLY` | Run checks only, write no code |
| `SCOPE CHECK` | List everything done this session |
| `WHAT HAVE YOU READ` | List every file accessed this session |
| `PHASE COMPLETE — HANDOVER` | Write full HANDOVER_DOCUMENT.md |
| `PUSH APPROVED` | Provide final git commands |
| `APPROVED` | Proceed with last submitted plan |

---

## 14. TOKEN EFFICIENCY RULES

- Skip: `node_modules/`, `.next/`, `target/`, `*.lock`, `public/images/`
- Files over 500 lines: read only relevant sections unless doing full audit
- If < 15,000 tokens remain → generate Handover Document immediately
- Use ARCHITECTURE_QUICKREF.md before re-reading full docs

---

## 15. CLOUDFLARE RULES

- `www` → apex redirect: **Cloudflare Bulk Redirect Rules ONLY** — never in code
- NEVER add Finance `.pages.dev` URL to the bulk redirect list
- Workers are the ONLY permitted backend ingress
- `npx wrangler deploy` only when `worker.js` or `wrangler.toml` actually changed — ASK USER FIRST
- KV namespace: `TREISHFIN_SEO_CACHE` — preserve all key prefixes (`sitemap:finance:`)

---

## 16. IMMUTABLE CHANGE HISTORY

- 2026-05-14 CREATED (v1): Initial agent instructions.
- 2026-05-14 UPDATED (v2): Root causes confirmed from codebase scan.
  BUG-FINANCE-01 root cause: X-Tenant-ID missing from worker.js.
  BUG-FINANCE-02 root cause: ROLE_PUBLISHER missing in Keycloak.
  CVE-001 and CVE-003 confirmed already fixed.
  Written by: Claude Sonnet 4.6.

- 2026-05-15 UPDATED (v3): Full new bug findings added from console error analysis.
  NEW: BUG-HYDRATION-01 (React #418/#423/#425 — HelmetProvider + browser APIs in SSR).
  NEW: BUG-FINANCE-02 expanded (403 on draft save — ModSecurity + SecurityConfig gap).
  NEW: BUG-LOGO-404 (logo.png missing, only logo.webp exists).
  NEW: BUG-FINANCE-01b (JSON vs FormData mismatch verification).
  NEW TASKS: Landing page enterprise upgrade, blog editor enhancement, public pages fix,
  SEO upgrade, GA4 no-consent standing instruction, Privacy/Terms update.
  Priority order reestablished with hydration fix as absolute P0.
  Updated by: Claude Sonnet 4.6 — for use with claude-opus-4-5+ for code generation.