/**
 * AI-CONTEXT:
 * Purpose: Next.js Root Layout wrapper.
 * Scope: Defines the global HTML shell, providers, and shared UI components.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Restored original React MainLayout.js structure/classes to fix design breakage.
 * - EDITED: Moved GlobalMarketTicker down into the <main> container to fix top-bar overlap.
 * - EDITED: Injected Next.js optimized GA4 tracking script securely using NEXT_PUBLIC_ env variables.
 */
import React from 'react';
import Script from 'next/script';
import './globals.css';
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
                    {/* Restored exact wrapper classes from original MainLayout.js */}
                    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
                        <Navbar />
                        {/* Restored exact <main> classes from MainLayout.js + Navbar padding */}
                        <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 min-h-screen pt-24 lg:pt-32">
                            {/* Ticker placed inside the container so it doesn't break the top layout */}
                            <GlobalMarketTicker />
                            {children}
                        </main>
                        <Footer className="hidden sm:block" />
                    </div>
                </Providers>
            </body>
        </html>
    );
}