import React from 'react';
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

    // AI-CONTEXT: Restored CRA standard DOM structure without Next.js font overrides.
    // Restored GlobalMarketTicker and top-padding logic exactly as it was in MainLayout.js.
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
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}