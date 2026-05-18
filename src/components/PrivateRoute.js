"use client";
/**
 * AI-CONTEXT:
 * Purpose: Route protection wrapper for admin components.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Migrated routing from `react-router-dom` (`<Navigate>`, `useLocation`) to Next.js App Router (`next/navigation`, `useRouter`, `usePathname`).
 * • Switched from declarative rendering (<Navigate>) to an imperative `useEffect` push for client-side protection.
 * • Added `"use client";` to top level.
 * • Why: Phase 3 Next.js Migration.
 * - EDITED (Current Phase):
 * • Added `hasRedirected` ref guard and `pathname.startsWith('/login')` check to prevent infinite redirect loops.
 * • Added error boundary UI for `auth.fatalError` to display visible state instead of endlessly redirecting or spinning.
 * • Why: Fixed a race condition where Keycloak init timeout caused PrivateRoute to endlessly redirect back to login.
 */

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Reset guard on unmount/organic navigation
        return () => {
            hasRedirected.current = false;
        };
    }, [pathname]);

    useEffect(() => {
        // Guard against loop: don't redirect if already on login or already redirected
        if (pathname.startsWith('/login') || hasRedirected.current) {
            return;
        }

        if (!loading && !auth.isAuthenticated && !auth.fatalError) {
            hasRedirected.current = true;
            router.push(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [loading, auth.isAuthenticated, auth.fatalError, router, pathname]);

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

    if (auth.fatalError) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md border border-red-200">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
                    <p className="text-slate-600 mb-6 text-sm">A secure token exchange failed due to network timeout or security policy. To protect your session, access is temporarily halted.</p>
                    <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors">Refresh Session</button>
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