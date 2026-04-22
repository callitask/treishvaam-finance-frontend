/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Operational guide for recovering Google Search Console (GSC) indexing status after resolving the Fatal DNS outage and implementing SPA Fallbacks.
 *
 * Scope:
 * - Google Search Console (GSC) Operations.
 * - Sitemap Resubmission.
 * - URL Inspection Tool.
 * - DNS Diagnostics.
 *
 * Critical Dependencies:
 * - Cloudflare Worker must be deployed with the "Aggressive SPA Fallback" logic.
 * - Apex Domain (`treishvaamfinance.com`) must be securely routed via Cloudflare Proxied CNAME records.
 *
 * Non-Negotiables:
 * - Do not assume Google will crawl automatically; manual triggers are required to overwrite cache errors.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial protocol for GSC resubmission following the SPA 404 fix.
 * - EDITED (LATEST):
 * • Updated protocol to address the "Host Unknown" fatal DNS error caused by Namecheap parking page hijack.
 * • Migrated instructions to the apex domain `treishvaamfinance.com`.
 */

# SEO RECOVERY & GSC RESUBMISSION PROTOCOL

## 1. CONTEXT: WHY THIS IS NECESSARY
We recently overcame two critical infrastructure failures that halted all Google indexing:

1.  **The Fatal DNS Hijack ("Host Unknown"):** The `www` canonical record was erroneously hijacked by a Namecheap default parking page, preventing traffic from reaching our Cloudflare Edge. This caused Googlebot to report a fatal DNS error. This has been resolved by mapping the Root (`@`) and `www` CNAME records strictly to the Cloudflare Pages deployment.
2.  **The SPA 404 Penalty:** Cloudflare Pages natively returned a `404 Not Found` for direct URL hits on React routes (e.g., `/about`). We deployed **Aggressive SPA Fallbacks** in the Cloudflare Worker to intercept these 404s and force a `200 OK` response by serving the `index.html` shell.

**The Action:** Because Google caches DNS errors aggressively, you must manually force Google to re-evaluate the domain to overwrite the "Host Unknown" and "404" flags.

---

## 2. STEP-BY-STEP RECOVERY

### PHASE A: VERIFY THE FIX (TEST LIVE URL)
Before asking Google to index, confirm the DNS and Worker are behaving correctly.

1.  Open **Google Search Console**.
2.  Select Property: `https://treishvaamfinance.com`.
3.  Click **URL Inspection** (top search bar).
4.  Enter: `https://treishvaamfinance.com/about`
5.  Click **TEST LIVE URL** (Top Right Button).
    * **CHECK:** "Page Availability" MUST say **"Page can be indexed"** (This proves the DNS error is cleared).
    * **CHECK:** HTTP Response MUST be **200 OK** (This proves the SPA Fallback Worker is operating correctly).

### PHASE B: SITEMAP RESUBMISSION
Force Google to re-read the entire map of the website now that the DNS pipe is restored.

1.  Go to **Sitemaps** in the left sidebar.
2.  Under "Add a new sitemap", enter: `sitemap.xml`
3.  Click **SUBMIT**.

### PHASE C: VALIDATE FIX (BULK ACTION)
Clear the error queues in GSC.

1.  Go to **Pages** (Indexing) in the left sidebar.
2.  Scroll down to **"Why pages aren't indexed"**.
3.  Click on **"Page with redirect"** or **"Not found (404)"**.
4.  Look for a button labeled **VALIDATE FIX**.
5.  Click it.

### PHASE D: PRIORITY INDEXING (MANUAL)
Perform **"Request Indexing"** (after testing the live URL) for these exact apex paths to kickstart the crawler:
1.  `https://treishvaamfinance.com/` (Root)
2.  `https://treishvaamfinance.com/about`
3.  `https://treishvaamfinance.com/vision`
4.  `https://treishvaamfinance.com/market/NVDA` (Example Market Page)

---

## 3. EXPECTED OUTCOME
* **Immediate:** "Test Live URL" connects successfully, bypassing the previous "Host unknown" error.
* **24-48 Hours:** The "Not Found (404)" error count in GSC will begin to decrease.
* **3-5 Days:** The Apex domain pages will begin appearing natively in Google Search results.