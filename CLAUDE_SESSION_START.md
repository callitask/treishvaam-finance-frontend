# TREISHVAAM GROUP — CLAUDE AGENT SESSION INITIALIZATION (v3)
# Roo runs this automatically. Execute ALL steps before responding to user.
# Updated: 2026-05-15

---

## STEP 1 — HANDOVER CHECK

Look for `HANDOVER_DOCUMENT.md` in the project root.
- **Found**: Read fully. Note current phase, DONE tasks, OUTSTANDING tasks.
- **Not found**: Session 1 or clean start. Begin from P0.

---

## STEP 2 — READ RULES FILES (in order)

```
RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Rules_of_Engagement.md
RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Treishvaam_Enterprise_Audit_Report.md
RULES OF ENGAGEMENT & AI INSTRUCTIONS & EDITS/Treishvaam_AI_Operations_Guide.md
```

Internalize: all CVEs, all phase checklists, all security rules, all cloudflare rules.

---

## STEP 3 — EXECUTE CODEBASE VERIFICATION SCAN

Scan every file listed below. Read actual content. Record findings.
**A comment mentioning a fix is NOT the fix. Only actual code patterns count.**

### Architecture Verification
| Check | File | What to verify |
|-------|------|---------------|
| ARCH-01 | `next.config.mjs` | `pageExtensions: ['tsx', 'ts']` present |
| ARCH-02 | `app/layout.tsx` | GA4 scripts present WITHOUT consent gate |
| ARCH-03 | `app/providers.tsx` | `HelmetProvider` ABSENT (if present = BUG-HYDRATION-01 still active) |
| ARCH-04 | `app/layout.tsx` | `suppressHydrationWarning` on `<html>` and `<body>` |
| ARCH-05 | `worker/worker.js` | `enhancedHeaders.set("X-Tenant-ID", "finance")` present |
| ARCH-06 | `src/apiConfig.js` | `BASE_URL` from `NEXT_PUBLIC_API_URL` (not hardcoded) |

### Bug Status Verification
| Bug ID | File | Evidence of Fix | Status |
|--------|------|----------------|--------|
| BUG-HYDRATION-01 | `app/providers.tsx` | HelmetProvider removed | ✅/🔴 |
| BUG-HYDRATION-01 | `app/layout.tsx` | `suppressHydrationWarning` present | ✅/🔴 |
| BUG-FINANCE-01 | `worker/worker.js` | `X-Tenant-ID: finance` in enhancedHeaders | ✅/🔴 |
| BUG-FINANCE-01 | `app/category/.../page.tsx` | `headers: { 'X-Tenant-ID': 'finance' }` in fetch | ✅/🔴 |
| BUG-FINANCE-02 | `nginx/conf.d/default.conf` | `/api/v1/posts/draft` location with SecRuleRemoveById | ✅/🔴 |
| BUG-FINANCE-02 | Keycloak Admin | `publisher` role assigned to editor user | Manual check |
| BUG-LOGO-404 | `public/` | `logo.png` exists OR all references updated to `.webp` | ✅/🔴 |

### P0 Security Checks (Backend)
| Check | File | What to verify |
|-------|------|---------------|
| P0-1 | `src/main/java/.../config/SecurityConfig.java` | `/actuator/health` permitAll AND `/actuator/**` ROLE_ADMIN |
| P0-4 | `src/main/java/.../security/RateLimitingFilter.java` | catch block has `response.setStatus(503)` |
| P0-6 | `docker-compose.yml` | Keycloak healthcheck uses `curl -f http://localhost:8080/health/ready` |

### Public Pages Verification
| Page | File | Must NOT redirect unauthenticated users |
|------|------|----------------------------------------|
| Blog feed | `src/pages/BlogPage.js` | Scan for `useAuth()` + redirect to /login |
| Single post | `src/pages/SinglePostPage.js` | Scan for auth gate |
| Landing | `app/page.tsx` | No auth required |

### GA4 Verification
| Check | File | What to verify |
|-------|------|---------------|
| GA4-01 | `app/layout.tsx` | GA4 scripts present |
| GA4-02 | `app/layout.tsx` | NO `gtag('consent', 'default', ...)` call |
| GA4-03 | Entire codebase | No `CookieBanner` wrapping GA4 scripts |

---

## STEP 4 — OUTPUT FORMAT AFTER SCAN

Output EXACTLY this block after completing all steps:

---

**✅ CONTEXT LOADED — SESSION v3 SCAN COMPLETE**

**📁 Files Read**
- Rules of Engagement: [confirmed/not found]
- Handover Document: [read — phase X] / [NOT PRESENT — fresh session]

---

**🔍 VERIFICATION RESULTS**

**Architecture**
| Check | Status | Evidence |
|-------|--------|---------|
| ARCH-01 pageExtensions | ✅/❌ | [value found] |
| ARCH-02 GA4 no consent | ✅/❌ | [found/missing] |
| ARCH-03 HelmetProvider absent | ✅/❌ | [absent/still present] |
| ARCH-04 suppressHydrationWarning | ✅/❌ | [present/missing] |
| ARCH-05 X-Tenant-ID in worker | ✅/❌ | [line found] |

**Bug Status**
| Bug | File | Status |
|-----|------|--------|
| BUG-HYDRATION-01 | providers.tsx + layout.tsx | 🔴 ACTIVE / ✅ FIXED |
| BUG-FINANCE-01 | worker.js + page.tsx | 🔴 ACTIVE / ✅ FIXED |
| BUG-FINANCE-02 | nginx + SecurityConfig | 🔴 ACTIVE / ✅ FIXED |
| BUG-LOGO-404 | public/ | 🔴 ACTIVE / ✅ FIXED |

**P0 Security**
| Check | Status |
|-------|--------|
| P0-1 Actuator restricted | ✅/❌ |
| P0-4 Rate limiter fail-closed | ✅/❌ |
| P0-6 KC healthcheck URL | ✅/❌ |

**Public Pages**
| Page | Auth Gate | Status |
|------|-----------|--------|
| BlogPage.js | [auth redirect found/absent] | ✅/🔴 |
| SinglePostPage.js | [auth redirect found/absent] | ✅/🔴 |

---

**📋 PHASE SUMMARY**
| Phase | Done | Remaining | Status |
|-------|------|-----------|--------|
| P0 — Hydration + Public Pages + Editor | N/4 | [list] | 🔄/✅ |
| P1 — Security + SEO + GA4 | N/4 | [list] | 🔄/⬜ |
| P2 — Backend Scalability | N/4 | [list] | 🔄/⬜ |

---

**🐛 ACTIVE BUGS**
[List each active bug with: root cause in one line, file, fix plan]

---

**⚡ RECOMMENDED NEXT ACTION**
[The single highest-priority unfixed item — describe fix plan in plain English]

---

**🟡 AWAITING YOUR CONFIRMATION**

→ **"APPROVED"** — Fix all active items starting with P0
→ **"FIX [BUG-ID]"** — Fix one specific bug
→ **"SHOW [TASK] PLAN"** — Show full plan before starting
→ **"VERIFY ONLY"** — Checks only, no code written
→ **"FIX HYDRATION"** — Fix React hydration errors first (recommended)

---

## PRE-VERIFIED FINDINGS FROM v2 SCAN (2026-05-14)

These were confirmed in the v2 scan. Verify they are still true each session:

- **P0-1 (CVE-001)**: ✅ FIXED — SecurityConfig.java: `/actuator/health` public, `/actuator/**` ROLE_ADMIN
- **P0-4 (CVE-003)**: ✅ FIXED — RateLimitingFilter.java: catch block sets status 503
- **P0-6 (KC-01)**: ✅ FIXED — docker-compose.yml: keycloak healthcheck uses `/health/ready`
- **BUG-FINANCE-01 A**: ✅ CODE FIXED in worker.js — verify `wrangler deploy` was run
- **BUG-FINANCE-01 B**: ✅ CODE FIXED in page.tsx — verify deployed to Cloudflare Pages

## NEW FINDINGS FROM v3 ANALYSIS (2026-05-15)

These are NEW active bugs found from console error analysis:
- **BUG-HYDRATION-01**: 🔴 ACTIVE — `HelmetProvider` + browser APIs causing #418/#423/#425 on all pages
- **BUG-FINANCE-02 (expanded)**: 🔴 ACTIVE — 403 on PUT draft likely ModSecurity + missing SecurityConfig rule
- **BUG-LOGO-404**: 🔴 ACTIVE — `logo.png` missing (only `logo.webp` exists in `public/`)
- **TASK-BLOG-PUBLIC-01**: 🔴 ACTIVE — Need to verify blog/post pages have no auth redirects
- **TASK-LANDING-01**: 🔴 REQUIRED — Landing page needs enterprise-grade upgrade
- **TASK-EDITOR-01**: 🔴 REQUIRED — Blog editor needs image/video support + full toolbar

---

## IMMUTABLE CHANGE HISTORY
- 2026-05-14 CREATED (v2): Initial session start protocol.
- 2026-05-15 UPDATED (v3): Added BUG-HYDRATION-01, BUG-LOGO-404, expanded BUG-FINANCE-02,
  added architecture verification checks, GA4 verification, public pages check.
  Added ARCH-03/ARCH-04 checks for hydration fix verification.
  Updated by: Claude Sonnet 4.6.