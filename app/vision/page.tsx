/**
 * AI-CONTEXT:
 * Purpose: Next.js wrapper for the legacy CRA Vision Page.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: App Router migration wrapper.
 * - EDITED (2026-05-15 Next.js Metadata Migration):
 * • Added `export const metadata`.
 * • Why: Migrating metadata from `react-helmet-async` in `VisionPage.js` to Next.js App Router
 * to fix Edge SSR crash (TypeError: Cannot read properties of undefined (reading 'add')).
 */
import VisionPage from '../../src/pages/VisionPage';

export const metadata = {
    title: 'Our Vision | Treishvaam Finance',
    description: 'We envision a world where financial literacy is universal. Explore our roadmap to interactive education and global mentorship.',
    alternates: {
        canonical: 'https://treishvaamfinance.com/vision',
    },
    openGraph: {
        type: 'website',
        url: 'https://treishvaamfinance.com/vision',
        title: 'Our Vision | Treishvaam Finance',
        description: 'We envision a world where financial literacy is universal. Explore our roadmap to interactive education and global mentorship.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
    twitter: {
        card: 'summary',
        title: 'Our Vision | Treishvaam Finance',
        description: 'We envision a world where financial literacy is universal. Explore our roadmap to interactive education and global mentorship.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
};

export default function Page() {
    return <VisionPage />;
}