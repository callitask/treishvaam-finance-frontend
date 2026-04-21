/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Operational guide for recovering Google Search Console (GSC) indexing status after Cloudflare Worker fixes.
 * - Explains how to trigger "Validate Fix" and "Request Indexing" for SPA routes.
 *
 * Scope:
 * - Google Search Console (GSC) Operations.
 * - Sitemap Resubmission.
 * - URL Inspection Tool.
 *
 * Critical Dependencies:
 * - Cloudflare Worker (treishfin-seo-worker) must be deployed with the "Aggressive SPA Fallback" logic.
 *
 * Non-Negotiables:
 * - Do not assume Google will crawl automatically; manual triggers are required for speed.
 * - Verify "Test Live URL" before requesting indexing.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Initial protocol for GSC resubmission following the SPA 404 fix.
 */

# SEO RECOVERY & GSC RESUBMISSION PROTOCOL

## 1. CONTEXT: WHY THIS IS NECESSARY
We have deployed a critical update to the **Cloudflare Worker**. Previously, when Googlebot requested pages like `/home` or `/about`, Cloudflare Pages returned a `404 Not Found` because these files do not physically exist (they are React routes).

**The Fix:** The Worker now intercepts these 404s and forces a `200 OK` response by serving `index.html`.

**The Action:** You must now tell Google that the issue is resolved so they stop reporting errors and start indexing the content.

---

## 2. STEP-BY-STEP RECOVERY

### PHASE A: VERIFY THE FIX (TEST LIVE URL)
Before asking Google to index, confirm the Worker is behaving correctly.

1.  Open **Google Search Console**.
2.  Select Property: `https://treishvaamfinance.com`.
3.  Click **URL Inspection** (top search bar).
4.  Enter: `https://treishvaamfinance.com/`
5.  Click **TEST LIVE URL** (Top Right Button).
    * **CHECK:** Screenshot tab. It should show the rendered page, not a 404 error.
    * **CHECK:** "Page Availability" should say **"Page can be indexed"**.
    * **CHECK:** HTTP Response should be **200 OK**.

### PHASE B: SITEMAP RESUBMISSION
Force Google to re-read the entire map of the website.

1.  Go to **Sitemaps** in the left sidebar.
2.  Under "Add a new sitemap", enter: `sitemap.xml`
3.  Click **SUBMIT**.

### PHASE C: VALIDATE FIX (BULK ACTION)
Clear the error queues in GSC.

1.  Go to **Pages** (Indexing) in the left sidebar.
2.  Scroll down to **"Why pages aren't indexed"**.
3.  Click on **"Not found (404)"**.
4.  Look for a button labeled **VALIDATE FIX**.
5.  Click it.

### PHASE D: PRIORITY INDEXING (MANUAL)
Perform **"Request Indexing"** (after testing live URL) for these exact paths:
1.  `https://treishvaamfinance.com/` (Root)
2.  `https://treishvaamfinance.com/about`
3.  `https://treishvaamfinance.com/market/NVDA` (Example Market Page)

---

## 3. EXPECTED OUTCOME
* **Immediate:** "Test Live URL" shows Green (Available).
* **24-48 Hours:** The "Not Found (404)" error count in GSC will decrease.
* **3-5 Days:** Pages like `/about` will appear in Google Search results.