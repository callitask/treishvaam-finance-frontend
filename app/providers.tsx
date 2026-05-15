/**
 * AI-CONTEXT:
 * Purpose: Client-side wrapper for Global Context Providers.
 * Scope: Wraps the application in Auth, Theme, and Watchlist contexts.
 *   Must NEVER contain HelmetProvider — Next.js App Router uses its own metadata API.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Extracted providers from CRA's App.js into a dedicated client-side component.
 * - EDITED: Added `HelmetProvider` from `react-helmet-async` to fix "Cannot read properties of undefined (reading 'add')" crash.
 * • Why: Phase 4 Next.js App Router migration.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix A):
 *   • REMOVED HelmetProvider import and wrapper entirely.
 *   • Why: HelmetProvider from react-helmet-async conflicts with Next.js App Router's built-in
 *     head/metadata management. It renders metadata nodes differently on server vs client,
 *     causing React hydration errors #418, #423, #425 on every page load.
 *   • Next.js App Router handles SEO via `export const metadata` or `generateMetadata()` in
 *     page/layout files. Any remaining <Helmet> calls in src/pages/*.js will silently no-op.
 *   • What must remain: AuthProvider, ThemeProvider, WatchlistProvider in this exact order.
 */
"use client";

import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WatchlistProvider } from '../src/context/WatchlistContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <WatchlistProvider>
                    {children}
                </WatchlistProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
