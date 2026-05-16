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
 * • Removed inaccurate/simulated telemetry blocks (Encryption, Latency).
 * • Unboxed the "Live Global Briefing" to create an elegant, spacious editorial layout.
 * • Reduced the gap between the left and right columns to better utilize screen real estate.
 * • Added a sleek 1-pixel horizontal progress bar to elegantly indicate the 7.5s news rotation.
 * • Upgraded news headlines to a high-end serif typography scale.
 * • Maintained the untouched Keycloak SSO authentication block.
 * - EDITED (Previous Phase):
 * • Restored the rotating/flashing "Live Global Briefing" (7.5s interval).
 * • Scaled down the hero heading to match global site typography.
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Overwrote legacy dark theme with premium light editorial design.
 * - EDITED: Integrated Keycloak auth (`login()`) into the `handleLoginRedirect` flow.
 * - EDITED: Corrected relative imports for the `app/login/` directory depth.
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNewsHighlights } from '../../src/apiConfig';
import { useAuth } from '../../src/context/AuthContext';
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaCircleNotch } from 'react-icons/fa';

export default function LoginPage() {
    const [news, setNews] = useState<any[]>([]);
    const [newsIndex, setNewsIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { login } = useAuth(); // Enables actual Keycloak OAuth login

    useEffect(() => {
        let isMounted = true;
        const fetchNews = async () => {
            try {
                const res = await getNewsHighlights();
                if (isMounted && res.data && res.data.length > 0) {
                    // Fetch top 10 items for the rotating terminal view
                    setNews(res.data.slice(0, 10));
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

    // Rotating Interval for Live Briefing
    useEffect(() => {
        if (news.length === 0) return;
        const interval = setInterval(() => {
            setNewsIndex((prev) => (prev + 1) % news.length);
        }, 7500); // Cycles every 7.5 seconds
        return () => clearInterval(interval);
    }, [news.length]);

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
        // Format as DD-MMM-YYYY HH:MM
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} ${time}`;
    };

    const currentArticle = news[newsIndex];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">

            {/* Solid Right Column Background to emphasize the 60/40 split */}
            <div className="fixed top-0 right-0 w-[40%] h-full bg-white border-l border-slate-200/80 -z-10 hidden lg:block shadow-[inset_20px_0_40px_rgba(0,0,0,0.01)]"></div>

            <div className="container mx-auto px-6 lg:px-12 min-h-screen flex flex-col justify-center py-12 lg:py-0 relative z-10">
                {/* Reduced gap from gap-24 to gap-12 to merge visual space better */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                    {/* LEFT COLUMN: 60% - Left-Aligned Enterprise Typography & Editorial Feed */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-10">

                        {/* Scaled-down, Innovative Hero Text */}
                        <div className="mb-14">
                            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5 font-sans">
                                The Network for <span className="font-serif font-light italic text-slate-500">Intelligent</span> Capital.
                            </h1>
                            <p className="text-base text-slate-600 max-w-lg leading-relaxed font-normal">
                                High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                            </p>
                        </div>

                        {/* Editorial News Block (Unboxed, spacious, max-w expanded) */}
                        <div className="w-full max-w-2xl flex flex-col relative">

                            {/* Sleek Top Separator with Progress Bar Animation */}
                            <div className="relative w-full h-[1px] bg-slate-200 mb-6">
                                <div className="absolute top-0 left-0 h-[1px] bg-slate-900 animate-progress-fill" key={newsIndex}></div>
                            </div>

                            {/* Terminal Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Global Briefing</span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400">
                                    {news.length > 0 ? `${newsIndex + 1} / ${news.length}` : '0 / 0'}
                                </span>
                            </div>

                            {/* Terminal Data Body (Flashing/Rotating) */}
                            <div className="flex-grow flex flex-col justify-center min-h-[140px] relative">
                                {loading ? (
                                    <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium w-full">
                                        <FaCircleNotch className="w-4 h-4 animate-spin text-slate-400" />
                                        <span>Syncing intelligence feed...</span>
                                    </div>
                                ) : currentArticle ? (
                                    <div key={newsIndex} className="animate-fade-in w-full">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-300 pb-0.5">
                                                {typeof currentArticle.source === 'string' ? currentArticle.source : (currentArticle.source?.name || 'Global Markets')}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[11px] font-medium text-slate-500">
                                                {formatTerminalDate(currentArticle.createdAt || currentArticle.publishedAt)}
                                            </span>
                                        </div>
                                        <h4 className="text-2xl lg:text-[1.75rem] font-serif font-medium text-slate-900 leading-[1.3] line-clamp-3">
                                            {currentArticle.title || currentArticle.headline}
                                        </h4>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-300 pb-0.5">System Status</span>
                                        </div>
                                        <h4 className="text-2xl font-serif font-medium text-slate-900 leading-[1.3]">
                                            Awaiting next intelligence packet. All monitoring systems operating normally.
                                        </h4>
                                    </div>
                                )}
                            </div>

                            {/* Sleek Bottom Separator */}
                            <div className="w-full h-[1px] bg-slate-200 mt-8"></div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: 40% - Login / Secure Access Portal (UNTOUCHED LOGIC & BOX) */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end mt-12 lg:mt-0">
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
                @keyframes fade-in { 0% { opacity: 0; transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes progress-fill { 0% { width: 0%; } 100% { width: 100%; } }
                
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-progress-fill { animation: progress-fill 7.5s linear forwards; }
            `}</style>
        </div>
    );
}