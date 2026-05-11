"use client";
/**
 * AI-CONTEXT:
 * Purpose: Next.js App Router wrapper for Home/Blog feed.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Wrapped in <Suspense> to fix Next.js 14 useSearchParams CSR bailout build error.
 */
import React, { Suspense } from 'react';
import BlogPage from '../../src/pages/BlogPage';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center text-slate-500">
                Loading feed...
            </div>
        }>
            <BlogPage />
        </Suspense>
    );
}