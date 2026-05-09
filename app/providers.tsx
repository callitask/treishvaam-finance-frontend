/**
 * AI-CONTEXT:
 * Purpose: Client-side wrapper for Global Context Providers.
 * Scope: Wraps the application in Auth, Theme, Watchlist, and Helmet contexts.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Extracted providers from CRA's App.js into a dedicated client-side component.
 * - EDITED: Added `HelmetProvider` from `react-helmet-async` to fix "Cannot read properties of undefined (reading 'add')" crash.
 * • Why: Phase 4 Next.js App Router migration.
 */
"use client";

import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { WatchlistProvider } from '../src/context/WatchlistContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <HelmetProvider>
            <AuthProvider>
                <ThemeProvider>
                    <WatchlistProvider>
                        {children}
                    </WatchlistProvider>
                </ThemeProvider>
            </AuthProvider>
        </HelmetProvider>
    );
}