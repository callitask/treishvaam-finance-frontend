SYSTEM IGNITION PROTOCOL: ENTERPRISE AI SESSION START

Hello Claude. You are operating in strict Enterprise Systems Architect mode. I have added `CLAUDE.md` to the root of this workspace. 

Before you take any action, read `CLAUDE.md` to understand your strict operational boundaries, the Zero-Trust architecture, and the Immutable Change History rules.

**CURRENT REPOSITORY CONTEXT:** You are currently executing inside the `treishvaam-finance-frontend` repository (Next.js 14). You do NOT have direct write access to the Spring Boot Backend repository from here. 

Because you are an autonomous agent, we will execute multiple phases in this session. You must follow them sequentially.

---

## PHASE 1: SAFE CHECKPOINT & BRANCHING (FRONTEND)
Before modifying any code, secure the current state of the frontend.
1. Run a git status check.
2. Provide and execute the command to tag the `main` branch as a safe checkpoint: `backup-pre-nextjs-fix-v1`.
3. Checkout and create a new branch: `feature/nextjs-migration`.
*Wait for my approval after completing Phase 1 before moving to Phase 2.*

## PHASE 2: CRITICAL BUG DIAGNOSIS & REPAIR (FRONTEND)
We have a critical crash in production on Single Post pages (e.g., `/category/taxation/sin-tax.../wed07012026...`).

**Console Logs:**
`[Auth] Init Failed: Error: Auth Timeout`
`TypeError: Cannot read properties of undefined (reading 'id')`

**Execution Steps:**
1. **Fix Auth Timeout:** Locate the Next.js Auth Provider (likely `src/context/AuthContext.js` or `app/providers.tsx`) and the Keycloak configuration. Add error boundary/fallback logic so if silent SSO fails or times out, it degrades gracefully for guest users instead of crashing the app. Ensure `silent-check-sso.html` is properly referenced.
2. **Fix TypeError:** Locate the Single Post Page component (`app/category/[categorySlug]/[postSlug]/[id]/page.tsx`). Add strict null-checks (e.g., `if (!post) return <NotFound />` or optional chaining `post?.id`) to ensure it handles undefined API responses gracefully without throwing a TypeError.
3. Update the `AI-CONTEXT` and `IMMUTABLE CHANGE HISTORY` in every file you modify.

## PHASE 3: COMPLIANCE & SEO (FRONTEND)
From our Enterprise Audit Report, we are missing the DPDP/GDPR compliance task.
1. Implement a Cookie Consent Banner component in the Finance Frontend (likely triggered in `app/layout.tsx`).
2. Ensure it delays GA4/AdSense initialization until consent is granted.

## PHASE 4: BACKEND CODE GENERATION (CROSS-WORKSPACE HANDOFF)
Since you cannot edit the backend directly from this VS Code window, you must act as the Enterprise Architect and generate the code for me to copy over to Eclipse. 

Create a new markdown file in the root of this frontend workspace called `BACKEND_IMPLEMENTATION_HANDOFF.md`. Inside this file, provide the **complete, exact Java/YAML/Bash code** required to fix the following outstanding backend Audit Report tasks:

1. **P2-1 (RateLimitingFilter.java):** Code to migrate Bucket4j from `ConcurrentHashMap` to Redis-backed `ProxyManager`.
2. **P2-2 (TenantContext.java):** Code to replace `InheritableThreadLocal` with Java 21 `ScopedValue`.
3. **P2-3 (User.java):** Code to add `@Convert(converter=EncryptedStringConverter.class)` to `linkedinAccessToken`.
4. **P2-4 (docker-compose.yml):** Code snippet to add `command: --log-bin=mysql-bin` to the MariaDB service.
5. **P2-5 (nightly_backup.sh):** Complete Bash script containing the verified MariaDB, MinIO, and Redis backup commands.
6. **P3-3 (AuthController.java):** Code to add a `DELETE /api/v1/auth/account` endpoint.
7. **P3-4 (ScheduledTasks.java):** Code for a `@Scheduled` cron job to purge `AudienceVisit` data older than 90 days.
8. **P4 (pom.xml & deploy.yml):** Code snippets to update the pom.xml version from `0.0.1-SNAPSHOT` to `1.0.0` and add Trivy/OWASP scanning to GitHub Actions.

---
**Execution Instruction for Claude:**
Start immediately with Phase 1. Analyze the git status, provide the tagging and branching commands, execute them if you have terminal access, and then stop. Tell me when you are ready to proceed to Phase 2.