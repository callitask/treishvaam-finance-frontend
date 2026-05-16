/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/"). Next.js App Router.
 * Enterprise-grade financial journalism landing page (Premium Light Editorial Theme).
 * * Scope:
 * - Strictly meant for SEO and secure portal access.
 * - Enforces the 60/40 visual split (Left: Live News / Right: Auth).
 * * Critical Dependencies:
 * - Backend: getNewsHighlights (from ../src/apiConfig)
 * - Ticker: GlobalMarketTicker (Dynamically imported to prevent Next.js hydration issues)
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Changed react-router-dom imports to next/link and next/navigation.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix D + P0-5 Enterprise Landing): Replaced static import GlobalMarketTicker with dynamic({ ssr: false }).
 * - EDITED: Overwrote legacy dark theme with premium light editorial design (Bloomberg/Mint style).
 * - EDITED: Removed promotional texts, category pills, and latest articles grid to prevent SEO dilution and UI noise.
 * - EDITED: Swapped hardcoded news arrays for real backend `getNewsHighlights` zero-CLS interval flasher.
 * - EDITED: Upgraded right column to a strict institutional flat-design (FactSet/Reuters style), right-aligned text, sharp borders.
 * - EDITED: Re-integrated GlobalMarketTicker at the absolute top of the layout.
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getNewsHighlights } from '../src/apiConfig';
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaRegClock } from 'react-icons/fa';

// Dynamically import the market ticker to prevent SSR hydration errors with browser APIs
const GlobalMarketTicker = dynamic(
    () => import('../src/components/market/GlobalMarketTicker'),
    { ssr: false }
);

export default function LandingPage() {
    const [news, setNews] = useState<any[]>([]);
    const [newsIndex, setNewsIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const fetchNews = async () => {
            try {
                const res = await getNewsHighlights();
                if (isMounted && res.data && res.data.length > 0) {
                    setNews(res.data.slice(0, 10)); // Top 10 highlights
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

    useEffect(() => {
        if (news.length === 0) return;
        const interval = setInterval(() => {
            setNewsIndex((prev) => (prev + 1) % news.length);
        }, 7500); // 7.5 seconds per headline for easier reading
        return () => clearInterval(interval);
    }, [news.length]);

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    const currentArticle = news[newsIndex];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 flex flex-col">

            {/* =========================================
                GLOBAL MARKET TICKER (Absolute Top)
            ========================================= */}
            <div className="w-full border-b border-slate-200 bg-white z-50 relative">
                <GlobalMarketTicker />
            </div>

            {/* Subtle Architectural Grid on Left (Enterprise Aesthetic) */}
            <div className="absolute inset-0 z-[0] opacity-[0.15] pointer-events-none w-[60%] hidden lg:block"
                style={{ backgroundImage: 'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)', backgroundSize: '4rem 4rem', maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
            </div>

            {/* Solid Right Column Background */}
            <div className="fixed top-0 right-0 w-[40%] h-full bg-slate-50 border-l border-slate-200/80 -z-10 hidden lg:block shadow-[inset_20px_0_40px_rgba(0,0,0,0.01)]"></div>

            <div className="flex-1 container mx-auto px-6 lg:px-12 flex flex-col justify-center py-12 lg:py-0 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT COLUMN: 60% - Editorial Messaging & News Flasher */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-[2px] bg-slate-900"></span>
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Global Market Intelligence</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5rem] font-serif font-medium text-slate-900 leading-[1.05] mb-8 tracking-tight">
                            The Network for <br /><span className="italic text-slate-500 font-light">Intelligent</span> Capital.
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-600 mb-14 leading-relaxed max-w-xl font-light">
                            High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                        </p>

                        {/* Premium Newsroom Highlight Box */}
                        <div className="w-full max-w-2xl relative min-h-[160px] pl-6 border-l-[3px] border-slate-900">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
                                    Live Global Briefing
                                </h2>
                            </div>

                            {loading ? (
                                <div className="space-y-4 animate-pulse pt-2">
                                    <div className="h-5 bg-slate-100 rounded w-full"></div>
                                    <div className="h-5 bg-slate-100 rounded w-4/5"></div>
                                    <div className="h-3 bg-slate-50 rounded w-1/3 mt-4"></div>
                                </div>
                            ) : currentArticle ? (
                                <article key={newsIndex} className="animate-fade-in-right absolute left-6 right-0">
                                    <Link href="/home" className="group block">
                                        <h3 className="text-xl lg:text-[1.65rem] font-serif font-medium text-slate-900 group-hover:text-sky-800 transition-colors leading-[1.3] line-clamp-3">
                                            {currentArticle.title || currentArticle.headline}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                                            {currentArticle.source && (
                                                <span className="text-slate-900 border-b border-slate-200 pb-0.5">
                                                    {typeof currentArticle.source === 'string' ? currentArticle.source : currentArticle.source.name}
                                                </span>
                                            )}
                                            {(currentArticle.publishedAt || currentArticle.createdAt) && (
                                                <span className="flex items-center gap-1.5">
                                                    <FaRegClock className="text-slate-400" />
                                                    <time dateTime={currentArticle.publishedAt || currentArticle.createdAt}>
                                                        {new Date(currentArticle.publishedAt || currentArticle.createdAt).toLocaleString(undefined, {
                                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </time>
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </article>
                            ) : (
                                <div className="text-sm text-slate-400 italic pt-2">Awaiting live market data feeds...</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 40% - Strict Institutional Portal */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end mt-10 lg:mt-0">
                        <div className="w-full max-w-md bg-white border border-slate-300 rounded-sm p-8 lg:p-10 relative z-10 shadow-sm">

                            {/* Right-Aligned Header */}
                            <div className="text-right mb-10 border-b border-slate-100 pb-6">
                                <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Client Access</h2>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Authenticate for institutional analytics</p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-800 text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <FaGoogle className="text-slate-500" />
                                        <span>Continue with Google</span>
                                    </div>
                                    <FaArrowRight className="text-slate-300 text-[10px]" />
                                </button>
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-800 text-sm font-medium">
                                    <div className="flex items-center gap-4">
                                        <FaLinkedinIn className="text-slate-500" />
                                        <span>Continue with LinkedIn</span>
                                    </div>
                                    <FaArrowRight className="text-slate-300 text-[10px]" />
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-800 text-sm font-medium">
                                        <FaTwitter className="text-slate-500" /> <span>X</span>
                                    </button>
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-sm hover:bg-slate-50 hover:border-slate-300 transition-colors text-slate-800 text-sm font-medium">
                                        <FaFacebookF className="text-slate-500" /> <span>Facebook</span>
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2 mb-8">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Entrance</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-sm hover:bg-slate-800 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <FaChartLine className="text-slate-400" />
                                    <span className="text-[11px] font-bold tracking-widest uppercase">Connect to Network</span>
                                </div>
                                <FaArrowRight className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 text-right">
                                <Link href="/home" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors inline-flex items-center gap-2 group">
                                    Explore as Guest &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
                @keyframes fade-in-right { 0% { opacity: 0; transform: translateX(-15px); } 100% { opacity: 1; transform: translateX(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
                .animate-fade-in-right { animation: fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}