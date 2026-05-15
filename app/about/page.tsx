/**
 * AI-CONTEXT:
 * Purpose: Next.js wrapper for the legacy CRA About Page.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: App Router migration wrapper.
 * - EDITED (2026-05-15 Next.js Metadata Migration):
 * • Added `export const metadata`.
 * • Why: Migrating metadata from `react-helmet-async` in `AboutPage.js` to Next.js App Router
 * to fix Edge SSR crash (TypeError: Cannot read properties of undefined (reading 'add')).
 */
import AboutPage from '../../src/pages/AboutPage';

export const metadata = {
    title: 'About Us | Treishvaam Finance',
    description: 'Treishvaam Finance is democratizing financial literacy through expert market analysis and education. Meet our founder, Amitsagar Kandpal, and discover our mission.',
    alternates: {
        canonical: 'https://treishvaamfinance.com/about',
    },
    openGraph: {
        type: 'website',
        url: 'https://treishvaamfinance.com/about',
        title: 'About Treishvaam Finance',
        description: 'Empowering your financial journey with clarity, integrity, and data-driven expertise.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'About Treishvaam Finance',
        description: 'Meet the team bridging the gap between complex markets and financial freedom.',
    },
};

export default function Page() {
    return <AboutPage />;
}