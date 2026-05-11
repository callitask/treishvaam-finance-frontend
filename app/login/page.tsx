/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Admin Login.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Handled 'noindex' robot tags natively via export metadata.
 */
import LoginPage from '../../src/pages/LoginPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Treishfin · Admin Login',
    robots: {
        index: false,
        follow: false
    }
};

export default function Page() {
    return <LoginPage />;
}