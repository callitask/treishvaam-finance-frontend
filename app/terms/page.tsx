/**
 * AI-CONTEXT:
 * Purpose: Next.js wrapper for the legacy CRA Terms Page.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: App Router migration wrapper.
 * - EDITED (2026-05-15 Next.js Metadata Migration):
 * • Added `export const metadata`.
 * • Why: Migrating metadata from `react-helmet-async` in `TermsPage.js` to Next.js App Router
 * to fix Edge SSR crash (TypeError: Cannot read properties of undefined (reading 'add')).
 */
import TermsPage from '../../src/pages/TermsPage';

export const metadata = {
    title: 'Terms of Service | Treishvaam Finance',
    description: 'Review the Terms of Service for Treishvaam Finance. Understand the rules, regulations, and disclaimers governing the use of our financial education platform.',
    alternates: {
        canonical: 'https://treishvaamfinance.com/terms',
    },
    openGraph: {
        type: 'website',
        url: 'https://treishvaamfinance.com/terms',
        title: 'Terms of Service | Treishvaam Finance',
        description: 'Review the Terms of Service for Treishvaam Finance. Understand the rules, regulations, and disclaimers governing the use of our financial education platform.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
    twitter: {
        card: 'summary',
        title: 'Terms of Service | Treishvaam Finance',
        description: 'Review the Terms of Service for Treishvaam Finance. Understand the rules, regulations, and disclaimers governing the use of our financial education platform.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
};

export default function Page() {
    return <TermsPage />;
}