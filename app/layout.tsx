/**
 * AI-CONTEXT:
 * Purpose: Next.js Root Layout wrapper.
 * Scope: Defines the global HTML shell, providers, and shared UI components.
 * * Security & Data Constraints:
 * - DATA COLLECTION MANDATE: Full GA4 data fidelity is required. Do NOT add `anonymize_ip: true` or 
 * restrict data collection payloads. The primary audience/jurisdiction (India) does not currently 
 * mandate anonymization for this usecase, and business requirements dictate complete data capture.
 * - CSP Nonces: All inline scripts must consume the `nonce={nonce}` extracted from Next.js headers.
 * * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Restored original React MainLayout.js structure/classes to fix design breakage.
 * - EDITED: Injected Next.js optimized GA4 tracking script securely using NEXT_PUBLIC_ env variables.
 * - EDITED: Reordered DOM and removed GlobalMarketTicker to allow specific page-level stacking.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix B):
 * • Added suppressHydrationWarning to <html> and <body> tags.
 * • Removed className={theme} from <html> — ThemeProvider manages it client-side via document.documentElement.
 * • Added anonymize_ip: true to GA4 config for DPDP/GDPR best practice.
 * • Added send_page_view: true to GA4 config.
 * • Added JSON-LD Organization schema for SEO.
 * • Why: suppressHydrationWarning silences expected client/server mismatches from auth state,
 * theme class, and timestamps. The theme className was causing mismatch because ThemeProvider
 * reads from localStorage client-side (different from server-rendered 'light').
 * - EDITED: Validated `suppressHydrationWarning` implementation to guarantee protection against Keycloak async init mismatch during SSR hydration.
 * - EDITED (Phase 3 — CSP Nonce):
 * • Added `import { headers } from 'next/headers'` to read x-nonce from middleware.
 * • Applied nonce prop to all Script components with dangerouslySetInnerHTML.
 * • Why: The middleware generates a per-request nonce and passes it via x-nonce header.
 * Without applying it to Script tags, the CSP blocks inline script execution.
 * - EDITED (Cloudflare Edge Fix):
 * • Added `export const runtime = 'edge';`.
 * • Why: Reading `headers()` forces dynamic rendering. Without this declaration, Next.js defaults to 
 * the Node.js runtime, which fails to compile under `@cloudflare/next-on-pages`. This forces Edge compilation globally.
 * - EDITED (Phase 6): 
 * • Injected `<WebVitalsTracker />` inside `<Providers>` to activate Core Web Vitals telemetry.
 * - EDITED (Phase 8):
 * • Imported `@fontsource-variable/inter` to self-host fonts instead of using Google CDN.
 * • Added `@ts-ignore` to bypass strict TS module resolution on the CSS side-effect import.
 * • Why: Enhances page load speeds, removes a network jump, and protects user privacy from Google Font API IP scraping.
 * - EDITED (AEGIS Phase 6.2 & Analytics Data Sync):
 * • Removed `anonymize_ip: true` from the GA4 config block.
 * • Injected `<AegisTelemetry />` client component for Layer 5 Behavioral Intelligence Engine tracking.
 * • Why: Business requirements mandate complete data collection; Indian jurisdiction compliance allows for full IP retention. AEGIS tracking successfully merged into the CSP-compliant Edge layout.
 * - EDITED (Phase 6 - Dynamic Privacy Toggle Integration):
 * • Conditionally injected `anonymize_ip: true` into the GA4 snippet based on `NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY`.
 * • Why: Maintains 100% data fidelity by default (for Indian users) but allows instant One-Click reversion to strict GDPR/DPDP anonymization if policies change.
 * - EDITED (Phase 6.3 - Enterprise GEO): 
 * • Injected `<link rel="llms-txt">` to broadcast AI endpoint to crawlers. 
 * • Hardened global SEO metadata for SGE compliance (max-snippet, max-image-preview, max-video-preview).
 * * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
import React from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';

// Phase 8: Privacy & Performance Local Fonts (Bypassing strict TS declaration check)
// @ts-ignore
import '@fontsource-variable/inter';

// AI-CONTEXT: Bypassing strict TS declaration check for the global stylesheet
// @ts-ignore
import '../src/index.css';

import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import WebVitalsTracker from '../src/components/WebVitalsTracker';
import AegisTelemetry from '../src/components/AegisTelemetry';
import { Providers } from './providers';

// ENFORCE CLOUDFLARE EDGE RUNTIME
export const runtime = 'edge';

export const metadata = {
    title: 'Treishvaam Finance | Institutional Financial Intelligence',
    description: 'Global financial news, proprietary market data, and expert analysis from India\'s premier financial intelligence platform.',
    openGraph: {
        title: 'Treishvaam Finance | Institutional Financial Intelligence',
        description: 'Global financial news, proprietary market data, and expert analysis.',
        url: 'https://treishvaamfinance.com',
        siteName: 'Treishvaam Finance',
        images: [{ url: 'https://treishvaamfinance.com/logo.webp', width: 512, height: 512, alt: 'Treishvaam Finance' }],
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Treishvaam Finance',
        description: 'India\'s premier financial intelligence platform.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
    metadataBase: new URL('https://treishvaamfinance.com'),
    alternates: {
        canonical: 'https://treishvaamfinance.com',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    // Phase 3: Read per-request CSP nonce from middleware
    const headersList = headers();
    const nonce = headersList.get('x-nonce') ?? '';

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Treishvaam Finance",
        "url": "https://treishvaamfinance.com",
        "logo": "https://treishvaamfinance.com/logo.webp",
        "description": "India's premier financial intelligence platform providing global financial news, proprietary market data, and expert analysis.",
        "foundingDate": "2024",
        "sameAs": [
            "https://linkedin.com/company/treishvaamfinance"
        ]
    };

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Generative Engine Optimization (GEO) Broadcasts */}
                <link rel="llms-txt" href="/llms.txt" nonce={nonce} />
                <link rel="alternate" type="text/markdown" href="/ai-feed.md" nonce={nonce} />

                <Script
                    id="organization-schema"
                    type="application/ld+json"
                    strategy="beforeInteractive"
                    nonce={nonce}
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
                {GA_MEASUREMENT_ID && (
                    <>
                        <Script
                            strategy="afterInteractive"
                            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                        />
                        <Script
                            id="google-analytics"
                            strategy="afterInteractive"
                            nonce={nonce}
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${GA_MEASUREMENT_ID}', {
                                        page_path: window.location.pathname,
                                        send_page_view: true${process.env.NEXT_PUBLIC_ENFORCE_STRICT_PRIVACY === 'true' ? ",\n                                        anonymize_ip: true" : ""}
                                    });
                                `,
                            }}
                        />
                    </>
                )}
            </head>
            <body suppressHydrationWarning>
                <Providers>
                    <WebVitalsTracker />
                    {/* AEGIS L5-BIE: Global passive behavioral tracking */}
                    <AegisTelemetry />

                    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
                        {/* 1. Menu Bar pinned natively to the top */}
                        <Navbar />

                        {/* No artificial padding gaps. Matches CRA MainLayout.js exactly */}
                        <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 min-h-screen">
                            {children}
                        </main>

                        <Footer className="hidden sm:block" />
                    </div>
                </Providers>
            </body>
        </html>
    );
}