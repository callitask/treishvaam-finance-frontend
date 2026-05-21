/**
 * AI-CONTEXT:
 * Purpose: Custom 404 Not Found page for Next.js App Router.
 * Why: Without this, Next.js serves a generic 404. A branded 404 improves UX
 * and prevents information disclosure in the default Next.js error page.
 * SEO: Returns HTTP 404 status automatically (Next.js App Router behavior).
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 3): Custom 404 page to prevent default Next.js info disclosure.
 * - EDITED (Cloudflare Edge Fix):
 * • Added `export const runtime = 'edge';` to resolve Cloudflare Pages compiler crash.
 */
import Link from 'next/link';

// ENFORCE CLOUDFLARE EDGE RUNTIME
export const runtime = 'edge';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}