/**
 * AI-CONTEXT:
 * Purpose: Next.js 14 Root Layout Component.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Added native `<link>` tags for Google Fonts in the `<head>`.
 * • Why: Bypasses the Webpack CSS parser crash while maintaining 100% design fidelity.
 */
import './globals.css';
import { Providers } from './providers';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import ThirdPartyScripts from '../src/components/ThirdPartyScripts';

export const metadata = {
    title: 'Treishvaam Group | Finance',
    description: 'The Network for Intelligent Capital.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:wght@300;400;700;900&display=swap" rel="stylesheet" />
            </head>
            <body className="font-sans bg-slate-50 text-gray-900 transition-colors duration-300 dark:bg-slate-900 dark:text-gray-100">
                <Providers>
                    <ThirdPartyScripts />
                    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
                        <Navbar />
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