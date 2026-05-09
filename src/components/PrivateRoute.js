"use client";
/**
 * AI-CONTEXT:
 * Purpose: Route protection wrapper for admin components.
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Migrated routing from `react-router-dom` (`<Navigate>`, `useLocation`) to Next.js App Router (`next/navigation`, `useRouter`, `usePathname`).
 * • Switched from declarative rendering (<Navigate>) to an imperative `useEffect` push for client-side protection.
 * • Added `"use client";` to top level.
 * • Why: Phase 3 Next.js Migration.
 */

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !auth.isAuthenticated) {
            router.push(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [loading, auth.isAuthenticated, router, pathname]);

    // Only block rendering for PROTECTED routes
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return null; // Return null while the useEffect handles the redirect
    }

    return children;
};

export default PrivateRoute;