/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Generates a cryptographically random nonce per HTTP request.
 * - Injects nonce into the Content-Security-Policy response header.
 * - Passes nonce to app/layout.tsx via x-nonce request header.
 * - Removes unsafe-inline and unsafe-eval from CSP — the primary XSS mitigation.
 * - Enforces Canonical Apex URL by redirecting /home to /.
 *
 * Scope:
 * - Runs on all routes EXCEPT static assets (already served without script execution).
 * - Does NOT run on /api/** routes (backend proxied via Worker, not Next.js server).
 *
 * Security Constraints:
 * - Nonce generated via crypto.randomUUID() — cryptographically secure.
 * - Nonce MUST NOT be logged, stored, or reused.
 *
 * Non-Negotiables:
 * - 'unsafe-inline' MUST NOT be present in script-src or style-src.
 * - 'unsafe-eval' MUST NOT be present (Next.js production builds do not need it).
 * - Cross-Origin-Embedder-Policy MUST NOT be set here — breaks AdSense/TradingView iframes.
 * - The x-nonce header is consumed by app/layout.tsx to inject nonce into Script tags.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED (Phase 3 — CSP Nonce):
 * • Created middleware.ts for per-request nonce-based CSP.
 * - EDITED (Edge Runtime Crash Fix):
 * • Replaced Node.js `Buffer.from()` with standard Web API `btoa()`.
 * • Why: `Buffer` is not natively supported in the strict Cloudflare Edge Runtime. When Next.js 
 * triggered dynamic RSC (React Server Component) fetches for routes like `/home`, the middleware 
 * threw a fatal `Buffer is not defined` error, resulting in a 500 Internal Server Error. 
 * `btoa()` perfectly resolves this while maintaining cryptographic integrity.
 * - EDITED (Post-Approval - Apex URL Enforcement):
 * • Added a 301 Permanent Redirect to map legacy `/home` traffic to the root `/`.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY must never be deleted, truncated, or regenerated.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Enforce Canonical Apex URL: Redirect /home to /
    if (request.nextUrl.pathname === '/home') {
        return NextResponse.redirect(new URL('/', request.url), 301);
    }

    // Generate a unique, cryptographically random nonce using strictly Web Standard APIs (Edge Safe)
    const nonce = btoa(crypto.randomUUID());

    const cspDirectives = [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://cloudflareinsights.com https://static.cloudflareinsights.com https://pagead2.googlesyndication.com`,
        `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
        `font-src 'self' data: https://fonts.gstatic.com`,
        `img-src 'self' data: blob: https:`,
        `connect-src 'self' https://*.treishvaamgroup.com https://backend.treishvaamgroup.com https://www.google-analytics.com https://analytics.google.com https://cloudflareinsights.com https://pagead2.googlesyndication.com`,
        `frame-src 'self' https://*.treishvaamgroup.com https://backend.treishvaamgroup.com`,
        `media-src 'self' https:`,
        `frame-ancestors 'self'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `upgrade-insecure-requests`,
    ].join('; ');

    const requestHeaders = new Headers(request.headers);
    // Pass nonce to layout.tsx Server Component via request header
    requestHeaders.set('x-nonce', nonce);

    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    // Set the complete CSP header on the response
    response.headers.set('Content-Security-Policy', cspDirectives);

    // Add the three missing Cross-Origin headers
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};