"use client";
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * AI-CONTEXT:
 * Purpose: Secure login page wrapper for Keycloak SSO.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/navigation.
 * - EDITED: Removed react-helmet-async entirely. SEO/noindex is now handled server-side by wrapper.
 */
const LoginPage = () => {
    const { login, auth, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    let from = searchParams?.get('redirect') || "/dashboard";
    if (from === "/login") from = "/dashboard";

    useEffect(() => {
        if (auth.isAuthenticated) {
            router.replace(from);
        }
    }, [auth.isAuthenticated, router, from]);

    return (
        <div className="min-h-screen hero-silver-gradient flex items-center justify-center p-4">
            <div className="container mx-auto flex items-center justify-center flex-col text-center">
                <LazyLoadImage alt="Logo" effect="blur" src="/logo.webp" className="h-24 w-auto mb-6" />
                <h1 className="text-4xl font-bold header-logo-text mb-4">Treishvaam Finance</h1>
                <p className="text-gray-600 mb-8 max-w-md">Secure Enterprise Login via Keycloak.</p>

                <button
                    onClick={login}
                    disabled={loading}
                    className={`py-3 px-8 rounded-lg text-white font-semibold shadow-lg transition duration-300 hover:scale-105 flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'cta-button-primary'}`}
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Connecting...</>
                    ) : (
                        "Sign In with SSO"
                    )}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;