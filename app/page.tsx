"use client";
/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/"). Next.js App Router.
 * Scope: 
 * - Strictly acts as the primary feed renderer to consolidate SEO on the apex domain.
 * - The legacy landing page UI has been migrated to /login.
 * Critical Dependencies:
 * - src/pages/BlogPage
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Removed 60/40 landing page UI and migrated it to app/login/page.tsx.
 * - EDITED: Implemented direct server-side redirect to /home.
 * - EDITED (Post-Approval Fix): Removed Next.js redirect('/home') and directly rendered `<BlogPage />`. This eliminates the RSC payload generation crash in Cloudflare Edge Runtime and enforces the `https://treishvaamfinance.com/` apex URL structure.
 */
import React, { Suspense } from 'react';
import BlogPage from '../src/pages/BlogPage';

export default function RootPage() {
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