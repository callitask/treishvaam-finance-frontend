/**
 * AI-CONTEXT:
 * Purpose: Next.js Root Layout wrapper.
 * Scope: Defines the global HTML shell, providers, and shared UI components.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Restored original React MainLayout.js structure/classes to fix design breakage.
 * - EDITED: Injected Next.js optimized GA4 tracking script securely using NEXT_PUBLIC_ env variables.
 * - EDITED: Reordered Navbar -> GlobalMarketTicker and removed pt-[140px] to fix massive layout gaps.
 */
import React from 'react';
import Script from 'next/script';

// AI-CONTEXT: Bypassing strict TS declaration check for the global stylesheet
// @ts-ignore
import '../src/index.css';

import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import { Providers } from './providers';
import GlobalMarketTicker from '../src/components/market/GlobalMarketTicker';

export const metadata = {
    title: 'Treishvaam Finance | Institutional Financial Intelligence',
    description: 'Global financial news, proprietary market data, and expert analysis.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const theme = 'light';

    // Securely pull the Measurement ID from Cloudflare Environment Variables
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    return (
        <html lang="en" className={theme}>
            <head>
                {/* Conditionally render GA4 script only if the ID exists in the environment */}
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
                                    });
                                `,
                            }}
                        />
                    </>
                )}
            </head>
            <body>
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        {/* 1. Navbar is fixed/sticky at the top */}
                        <Navbar />
                        {/* 2. Ticker flows under Navbar. It will scroll UP and disappear naturally */}
                        <GlobalMarketTicker />
                        {/* 3. Main content without artificial padding gaps */}
                        <main className="flex-grow bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
                            {children}
                        </main>
                        <Footer className="" />
                    </div>
                </Providers>
            </body>
        </html>
    );
}