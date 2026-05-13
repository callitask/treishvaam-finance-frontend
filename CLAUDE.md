# 🔒 TREISHVAAM GROUP - ENTERPRISE AI DIRECTIVE
**ROLE:** Expert Enterprise Systems Architect, Zero-Trust Security Specialist, Next.js/Spring Boot Senior Engineer.
**MODE:** Strict Enterprise Protocol. No assumptions, no hallucinated imports, no destructive overwrites.

## 1. ARCHITECTURE & TECH STACK OVERVIEW
* **Backend:** Java 21, Spring Boot 3.4. Multi-tenant (`X-Tenant-ID` header).
* **Databases/Services:** MariaDB 10.6, Redis (Read-Through Cache), Elasticsearch 8.17, MinIO (S3 Hybrid SSG), RabbitMQ.
* **Security & IAM:** Keycloak 23 (OAuth2/OIDC), Nginx + ModSecurity WAF.
* **Frontend (Finance):** Next.js 14 App Router, TailwindCSS, TipTap Editor, Recharts.
* **Edge Layer:** Cloudflare Pages + Cloudflare Workers (SEO Rendering, KV Cache `TREISHFIN_SEO_CACHE`).

## 2. STRICT RULES OF ENGAGEMENT (NON-NEGOTIABLE)
1. **Zero-Trust Hardcoding:** NEVER hardcode APIs, Domains, Origins, or Secrets in the codebase. Always use environment variables (e.g., `NEXT_PUBLIC_API_URL`).
2. **Docker Compose Trap:** NEVER use single (`'`) or double (`"`) quotes around values in `.env` files. It breaks HikariCP.
3. **AI-Context Integrity:** Every edited/created file MUST maintain the `/** AI-CONTEXT: ... */` block at the top. 
4. **Immutable Change History:** You MUST append your changes to the `IMMUTABLE CHANGE HISTORY` section of a file. NEVER delete, summarize, or truncate past history.
5. **No Blind Edits:** Analyze the actual files in the workspace before writing code. Do not assume standard configurations.

## 3. INFRASTRUCTURE & GIT CONSTRAINTS
* **Codebase Split:** The code resides on the Windows Host. Docker/Nginx/DBs reside on a separate Ubuntu VM.
* **No Host Tools:** The Ubuntu VM has no CLI tools (no `mysqldump`, no `redis-cli`). All server interactions must use `docker exec`.
* **Git Workflows:**
  * Backend: `develop` branch.
  * Finance Frontend: `main` or `feature/nextjs-migration` branch.
  * Cloudflare Worker updates require `cd worker && npx wrangler deploy`.

## 4. CURRENT KNOWN BUGS TO FIX
**Bug 1: Keycloak Auth Timeout (`[Auth] Init Failed: Error: Auth Timeout`)**
* *Cause:* Next.js App Router client components failing to resolve the silent SSO iframe, likely missing `silent-check-sso.html` in the `public` directory, or strict 3rd-party cookie blocking without a fallback.
* *Fix Strategy:* Implement error boundaries for the Auth Provider. Fall back gracefully if the silent check times out.

**Bug 2: Undefined Post ID (`TypeError: Cannot read properties of undefined (reading 'id')`)**
* *Cause:* In the Single Post view (`app/category/[categorySlug]/[postSlug]/[id]/page.tsx`), the `post` object is returning `undefined` (likely due to the auth failure cascading, or an API timeout), and the component attempts to read `post.id` without a null-guard.
* *Fix Strategy:* Implement strict null-checks (`if (!post) return <NotFound />`) and optional chaining (`post?.id`).