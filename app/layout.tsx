/**
 * AI-CONTEXT:
 * Purpose: Next.js Root Layout wrapper.
 * Scope: Defines the global HTML shell, providers, and shared UI components.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Restored original React MainLayout.js structure/classes to fix design breakage.
 * - EDITED: Injected Next.js optimized GA4 tracking script securely using NEXT_PUBLIC_ env variables.
 * - EDITED: Reordered DOM and removed GlobalMarketTicker to allow specific page-level stacking.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix B):
 *   • Added suppressHydrationWarning to <html> and <body> tags.
 *   • Removed className={theme} from <html> — ThemeProvider manages it client-side via document.documentElement.
 *   • Added anonymize_ip: true to GA4 config for DPDP/GDPR best practice.
 *   • Added send_page_view: true to GA4 config.
 *   • Added JSON-LD Organization schema for SEO.
 *   • Why: suppressHydrationWarning silences expected client/server mismatches from auth state,
 *     theme class, and timestamps. The theme className was causing mismatch because ThemeProvider
 *     reads from localStorage client-side (different from server-rendered 'light').
 */
import React from 'react';
import Script from 'next/script';

// AI-CONTEXT: Bypassing strict TS declaration check for the global stylesheet
// @ts-ignore
import '../src/index.css';

import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { Providers } from './providers';

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
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
                <Script
                    id="organization-schema"
                    type="application/ld+json"
                    strategy="beforeInteractive"
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
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${GA_MEASUREMENT_ID}', {
                                        page_path: window.location.pathname,
                                        anonymize_ip: true,
                                        send_page_view: true
                                    });
                                `,
                            }}
                        />
                    </>
                )}
            </head>
            <body suppressHydrationWarning>
                <Providers>
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
