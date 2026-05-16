"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, TrendingUp, Globe, Clock } from 'lucide-react';

/**
 * AI-CONTEXT:
 * Purpose: Secure login page wrapper for Keycloak SSO, featuring dynamic global briefing.
 * * Scope:
 * - Handles user authentication entry point.
 * - Fetches and displays dynamic real-time market/geopolitical news on the left panel.
 * * Critical Dependencies:
 * - AuthContext for SSO trigger.
 * - Backend `/api/news-highlights` endpoint for the briefing data.
 * * Security Constraints:
 * - API URLs must be injected via environment variables (Zero-Trust).
 * - No hardcoded news data.
 * * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Current Phase):
 * • Revamped layout to an enterprise-grade split screen.
 * • Added dynamic "Live Global Briefing" section fetching from backend API on the left.
 * • Applied text-right alignment on the left panel for an innovative, professional layout.
 * • Enforced strict light theme (no dark backgrounds).
 * • Why: To align with Fortune 500 aesthetic requirements and ensure no static data in the hero section.
 * * - EDITED: Migrated from react-router-dom to next/navigation.
 * - EDITED: Removed react-helmet-async entirely. SEO/noindex is now handled server-side by wrapper.
 * * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
const LoginPage = () => {
    const { login, auth, loading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Dynamic News State
    const [briefings, setBriefings] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);

    let from = searchParams?.get('redirect') || "/dashboard";
    if (from === "/login") from = "/dashboard";

    useEffect(() => {
        if (auth.isAuthenticated) {
            router.replace(from);
        }
    }, [auth.isAuthenticated, router, from]);

    // Fetch dynamic news for the Live Global Briefing
    useEffect(() => {
        const fetchBriefings = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';
                // Attempt to fetch from the standard news endpoint
                const res = await fetch(`${apiUrl}/api/news-highlights`);
                if (res.ok) {
                    const data = await res.json();
                    // Extract top 2 or 3 critical news items
                    const topNews = Array.isArray(data) ? data.slice(0, 2) : [];
                    setBriefings(topNews);
                }
            } catch (error) {
                console.error("Failed to fetch live global briefing", error);
            } finally {
                setNewsLoading(false);
            }
        };

        fetchBriefings();
    }, []);

    // Helper to format dates gracefully
    const formatDate = (dateString) => {
        if (!dateString) return "Recent Update";
        const d = new Date(dateString);
        return isNaN(d) ? "Recent Update" : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-slate-200 selection:text-slate-900">
            <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                {/* --- Left Side: Innovative Right-Aligned Dynamic Briefing --- */}
                <div className="hidden lg:flex flex-col items-end text-right space-y-10 pr-8 border-r border-slate-200">

                    {/* Hero Text */}
                    <div>
                        <h1 className="text-5xl font-light text-slate-900 tracking-tight mb-6 font-serif leading-tight">
                            The Network for <br />
                            <span className="font-semibold text-slate-800">Intelligent Capital.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-md ml-auto leading-relaxed font-light">
                            High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                        </p>
                    </div>

                    {/* Dynamic Live Global Briefing */}
                    <div className="w-full max-w-md pt-8 border-t border-slate-200">
                        <div className="flex items-center justify-end space-x-2 mb-6">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Global Briefing</h3>
                        </div>

                        <div className="space-y-6 flex flex-col items-end">
                            {newsLoading ? (
                                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Syncing intelligence...</span>
                                </div>
                            ) : briefings.length > 0 ? (
                                briefings.map((item, index) => (
                                    <div key={item.id || index} className="group max-w-sm">
                                        <div className="flex items-center justify-end space-x-2 mb-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                            <span>{item.source || 'Marketwatch'}</span>
                                            <span>•</span>
                                            <span>{formatDate(item.createdAt || item.publishedAt)}</span>
                                        </div>
                                        <h4 className="text-base font-medium text-slate-800 group-hover:text-slate-600 transition-colors leading-snug">
                                            {item.title}
                                        </h4>
                                    </div>
                                ))
                            ) : (
                                <div className="max-w-sm">
                                    <div className="flex items-center justify-end space-x-2 mb-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
                                        <span>System Status</span>
                                    </div>
                                    <h4 className="text-base font-medium text-slate-800 leading-snug">
                                        Awaiting next intelligence packet. All geopolitical and macro systems operating normally.
                                    </h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Secure Login Box (Intact per instructions) --- */}
                <div className="flex items-center justify-center lg:justify-start">
                    <div className="bg-white p-10 md:p-14 rounded-sm shadow-sm border border-slate-200 w-full max-w-md text-center">
                        <div className="flex justify-center mb-8">
                            <LazyLoadImage
                                alt="Treishvaam Finance Logo"
                                effect="blur"
                                src="/logo.webp"
                                className="h-20 w-auto"
                            />
                        </div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-3 font-serif">Secure Access</h2>
                        <p className="text-slate-500 mb-10 font-light text-sm">Authenticate via Enterprise Keycloak SSO.</p>

                        <button
                            onClick={login}
                            disabled={loading}
                            className={`w-full py-4 px-8 rounded-sm text-white font-medium transition-all duration-300 flex items-center justify-center gap-3 ${loading
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-slate-900 hover:bg-slate-800 shadow-md hover:shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Authenticating...</>
                            ) : (
                                "Sign In to Terminal"
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;