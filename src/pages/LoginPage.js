"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Globe } from 'lucide-react';

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
 * • Refactored left panel: Changed alignment from right to strict left for enterprise readability.
 * • Unified heading typography to single size ("The Network for Intelligent Capital").
 * • Re-architected the "Live Global Briefing" component into a professional, bordered financial terminal feed.
 * • Maintained zero-touch policy on the right-side SSO component.
 * * - EDITED (Previous Phase):
 * • Revamped layout to an enterprise-grade split screen.
 * • Added dynamic "Live Global Briefing" section fetching from backend API.
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
                const res = await fetch(`${apiUrl}/api/news-highlights`);
                if (res.ok) {
                    const data = await res.json();
                    // Extract top 2 critical news items for the terminal view
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

    // Helper to format dates cleanly for the terminal view
    const formatTerminalDate = (dateString) => {
        if (!dateString) return "LIVE";
        const d = new Date(dateString);
        if (isNaN(d)) return "LIVE";
        // Format as DD-MMM-YYYY HH:MM
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 lg:p-12 selection:bg-slate-200 selection:text-slate-900">
            <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                {/* --- Left Side: Left-Aligned Enterprise Typography & Terminal Feed --- */}
                <div className="hidden lg:flex flex-col items-start justify-center pr-8">

                    {/* Unified Hero Text */}
                    <div className="mb-12">
                        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
                            The Network for Intelligent Capital.
                        </h1>
                        <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-normal">
                            High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                        </p>
                    </div>

                    {/* Financial Terminal / Briefing Block */}
                    <div className="w-full max-w-lg bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">

                        {/* Terminal Header */}
                        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Globe className="w-4 h-4 text-slate-500" strokeWidth={2.5} />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Live Global Briefing</span>
                            </div>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>

                        {/* Terminal Data Body */}
                        <div className="p-0">
                            {newsLoading ? (
                                <div className="flex items-center space-x-3 p-6 text-slate-500 text-sm font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Syncing intelligence feed...</span>
                                </div>
                            ) : briefings.length > 0 ? (
                                <ul className="divide-y divide-slate-100">
                                    {briefings.map((item, index) => (
                                        <li key={item.id || index} className="p-6 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    {item.source || 'Marketwatch'}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                                                    {formatTerminalDate(item.createdAt || item.publishedAt)}
                                                </span>
                                            </div>
                                            <h4 className="text-base font-semibold text-slate-900 leading-snug">
                                                {item.title}
                                            </h4>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                                    </div>
                                    <h4 className="text-base font-semibold text-slate-900 leading-snug">
                                        Awaiting next intelligence packet. All geopolitical and macro monitoring systems operating normally.
                                    </h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Secure Login Box (LOCKED/UNTOUCHED) --- */}
                <div className="flex items-center justify-center lg:justify-end">
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