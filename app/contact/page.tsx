/**
 * AI-CONTEXT:
 * Purpose: Next.js wrapper for the legacy CRA Contact Page.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: App Router migration wrapper.
 * - EDITED (2026-05-15 Next.js Metadata Migration):
 * • Added `export const metadata`.
 * • Why: Migrating metadata from `react-helmet-async` in `ContactPage.js` to Next.js App Router
 * to fix Edge SSR crash (TypeError: Cannot read properties of undefined (reading 'add')).
 */
import ContactPage from '../../src/pages/ContactPage';

export const metadata = {
    title: 'Contact Us | Treishvaam Finance',
    description: 'Get in touch with Treishvaam Finance for inquiries about our market analysis, educational content, or platform support.',
    alternates: {
        canonical: 'https://treishvaamfinance.com/contact',
    },
    openGraph: {
        type: 'website',
        url: 'https://treishvaamfinance.com/contact',
        title: 'Contact Us | Treishvaam Finance',
        description: 'Get in touch with Treishvaam Finance for inquiries about our market analysis, educational content, or platform support.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
    twitter: {
        card: 'summary',
        title: 'Contact Us | Treishvaam Finance',
        description: 'Get in touch with Treishvaam Finance for inquiries about our market analysis, educational content, or platform support.',
        images: ['https://treishvaamfinance.com/logo.webp'],
    },
};

export default function Page() {
    return <ContactPage />;
}