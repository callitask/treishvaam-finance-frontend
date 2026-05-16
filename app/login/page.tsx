/**
 * AI-CONTEXT:
 * Purpose: Dedicated Authentication Hub ("/login"). Next.js App Router.
 * Scope:
 * - Strictly meant for SEO and secure portal access.
 * - Enforces the 60/40 visual split (Left: Live News Terminal / Right: Auth).
 * Critical Dependencies:
 * - Backend: getNewsHighlights (from ../../src/apiConfig)
 * - Auth: useAuth (from ../../src/context/AuthContext)
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase):
 * • Fully revamped the left panel (60%) into a static, highly professional financial terminal feed.
 * • Unified the hero heading typography to a single, authoritative scale (`text-5xl lg:text-6xl font-bold`).
 * • Removed the rotating `setInterval` news flasher; now statically displays the top 2-3 live intelligence briefings.
 * • Maintained the untouched right-side Keycloak SSO authentication block.
 * • Enforced a strict slate/white Fortune 500 enterprise light theme.
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Overwrote legacy dark theme with premium light editorial design.
 * - EDITED: Re-applied exact design block approved by user, strictly preserving requested layout, classes, and structure.
 * - EDITED: Integrated Keycloak auth (`login()`) into the `handleLoginRedirect` flow.
 * - EDITED: Corrected relative imports for the `app/login/` directory depth.
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNewsHighlights } from '../../src/apiConfig';
import { useAuth } from '../../src/context/AuthContext';
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaGlobe, FaCircleNotch } from 'react-icons/fa';

export default function LoginPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { login } = useAuth(); // Enables actual Keycloak OAuth login

    useEffect(() => {
        let isMounted = true;
        const fetchNews = async () => {
            try {
                const res = await getNewsHighlights();
                if (isMounted && res.data && res.data.length > 0) {
                    // Fetch top 3 items for a static, structured terminal view
                    setNews(res.data.slice(0, 3));
                }
            } catch (error) {
                console.error("News fetch error", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchNews();
        return () => { isMounted = false; };
    }, []);

    const handleLoginRedirect = () => {
        if (login) {
            login(); // Triggers the real authentication flow
        } else {
            console.warn("AuthContext not fully loaded or Keycloak missing.");
            router.push('/home');
        }
    };

    // Helper to format dates cleanly for the terminal view
    const formatTerminalDate = (dateString?: string) => {
        if (!dateString) return "LIVE";
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return "LIVE";
        // Format as DD-MMM-YYYY
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">

            {/* Solid Right Column Background to emphasize the 60/40 split */}
            <div className="fixed top-0 right-0 w-[40%] h-full bg-white border-l border-slate-200/80 -z-10 hidden lg:block shadow-[inset_20px_0_40px_rgba(0,0,0,0.01)]"></div>

            <div className="container mx-auto px-6 lg:px-12 min-h-screen flex flex-col justify-center py-12 lg:py-0 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT COLUMN: 60% - Left-Aligned Enterprise Typography & Terminal Feed */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-8">

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
                        <div className="w-full max-w-xl bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">

                            {/* Terminal Header */}
                            <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FaGlobe className="text-slate-500 text-sm" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Live Global Briefing</span>
                                </div>
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            </div>

                            {/* Terminal Data Body */}
                            <div className="p-0">
                                {loading ? (
                                    <div className="flex items-center space-x-3 p-6 text-slate-500 text-sm font-medium">
                                        <FaCircleNotch className="w-4 h-4 animate-spin text-slate-400" />
                                        <span>Syncing intelligence feed...</span>
                                    </div>
                                ) : news.length > 0 ? (
                                    <ul className="divide-y divide-slate-100">
                                        {news.map((item, index) => (
                                            <li key={item.id || index} className="p-5 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {typeof item.source === 'string' ? item.source : (item.source?.name || 'Global Markets')}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">
                                                        {formatTerminalDate(item.createdAt || item.publishedAt)}
                                                    </span>
                                                </div>
                                                <h4 className="text-[15px] font-semibold text-slate-900 leading-snug">
                                                    {item.title || item.headline}
                                                </h4>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                                        </div>
                                        <h4 className="text-[15px] font-semibold text-slate-900 leading-snug">
                                            Awaiting next intelligence packet. All geopolitical and macro monitoring systems operating normally.
                                        </h4>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: 40% - Login / Secure Access Portal (UNTOUCHED) */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end mt-10 lg:mt-0">
                        <div className="w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-xl p-8 lg:p-10 relative z-10">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 mb-4 shadow-sm">
                                    <FaLock className="text-slate-400 text-lg" />
                                </div>
                                <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Secure Access</h2>
                                <p className="text-sm text-slate-500">Authenticate to enter the private network.</p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium shadow-sm">
                                    <FaGoogle className="text-red-500 text-lg" /> Continue with Google
                                </button>
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium shadow-sm">
                                    <FaLinkedinIn className="text-[#0077b5] text-lg" /> Continue with LinkedIn
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium shadow-sm">
                                        <FaTwitter className="text-slate-900 text-lg" /> X
                                    </button>
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium shadow-sm">
                                        <FaFacebookF className="text-[#1877f2] text-lg" /> Facebook
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2 mb-6">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Sign-In</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group">
                                <div className="flex items-center gap-3">
                                    <FaChartLine className="text-sky-400" />
                                    <span className="text-xs font-bold tracking-wide uppercase">Connect Platform</span>
                                </div>
                                <FaArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </button>

                            <div className="mt-8 text-center">
                                <Link href="/home" className="text-xs font-bold text-slate-500 hover:text-sky-700 uppercase tracking-widest transition-colors inline-flex items-center gap-2 group">
                                    Explore as Guest
                                    <span className="w-4 h-[1px] bg-slate-300 group-hover:w-6 group-hover:bg-sky-700 transition-all"></span>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
            `}</style>
        </div>
    );
}