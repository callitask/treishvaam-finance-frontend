/**
 * AI-CONTEXT:
 * Purpose: Next.js SSR Component wrapper for Admin Login.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Handled 'noindex' robot tags natively via export metadata.
 * - EDITED: Added React Suspense boundary to fix useSearchParams() static build crash.
 */
import LoginPage from '../../src/pages/LoginPage';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
    title: 'Treishfin · Admin Login',
    robots: {
        index: false,
        follow: false
    }
};

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin"></div>
            </div>
        }>
            <LoginPage />
        </Suspense>
    );
}