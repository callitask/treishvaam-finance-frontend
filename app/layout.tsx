import React from 'react';

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

    return (
        <html lang="en" className={theme}>
            <body>
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <GlobalMarketTicker />
                        <Navbar />
                        <main className="flex-grow pt-[120px] lg:pt-[140px] bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
                            {children}
                        </main>
                        {/* AI-CONTEXT: Passed empty className to satisfy TS validation */}
                        <Footer className="" />
                    </div>
                </Providers>
            </body>
        </html>
    );
}