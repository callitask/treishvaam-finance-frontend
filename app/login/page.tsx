"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Login page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Wrapped in <Suspense> to fix Next.js 14 useSearchParams CSR bailout build error.
 */
import React, { Suspense } from 'react';
import LoginPage from '../../src/pages/LoginPage';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading secure login...
            </div>
        }>
            <LoginPage />
        </Suspense>
    );
}