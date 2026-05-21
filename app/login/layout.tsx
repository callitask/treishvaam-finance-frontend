/**
 * AI-CONTEXT:
 * Purpose: Server-Side Metadata wrapper for the Login route.
 * Scope:
 * - Injects the correct Canonical Tag and SEO metadata for the /login page.
 * - Fixes the GSC "Alternate page with proper canonical tag" indexing failure.
 * Critical Dependencies:
 * - Next.js App Router Metadata API.
 * Non-Negotiables:
 * - Must remain a Server Component (no 'use client' directive).
 * - Canonical tag MUST point precisely to https://treishvaamfinance.com/login.
 * * IMMUTABLE CHANGE HISTORY:
 * - ADDED: Created layout to override the root layout.tsx canonical tag which was incorrectly telling Google that the login page was a duplicate of the homepage.
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Secure Access | Treishvaam Finance',
    description: 'Authenticate to enter the private intelligence network. Access independent financial journalism, institutional market analysis, and expert geopolitical views.',
    alternates: {
        canonical: 'https://treishvaamfinance.com/login',
    },
    robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    openGraph: {
        title: 'Secure Access | Treishvaam Finance',
        description: 'Authenticate to enter the private intelligence network.',
        url: 'https://treishvaamfinance.com/login',
        type: 'website',
    }
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Passes the layout transparently to the client-side app/login/page.tsx
    return <>{children}</>;
}