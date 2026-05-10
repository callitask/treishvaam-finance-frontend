import React from 'react';
import { Inter, Merriweather } from 'next/font/google';
import './globals.css';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import Providers from './providers';

// Fonts setup
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--font-merriweather' });

export const metadata = {
    title: 'Treishvaam Finance | Institutional Financial Intelligence',
    description: 'Global financial news, proprietary market data, and expert analysis.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Safe to read cookies on server or let client handle theme class
    const theme = 'light';

    return (
        <html lang="en" className={`${inter.variable} ${merriweather.variable} ${theme}`}>
            <body className="antialiased font-sans">
                <Providers>
                    {/* AI-CONTEXT: 
                      Navbar already renders the GlobalMarketTicker internally.
                      Removed the secondary `<GlobalMarketTicker />` call from here.
                    */}
                    <Navbar />

                    {/* AI-CONTEXT: 
                      Removed pt-[120px] which was forcing a massive visual gap. 
                      Navbar handles its own sticky height in the document flow.
                    */}
                    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
                        {children}
                    </main>

                    <Footer />
                </Providers>
            </body>
        </html>
    );
}