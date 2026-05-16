/**
 * AI-CONTEXT:
 * Purpose: Dedicated Authentication Hub ("/login"). Next.js App Router.
 * Enterprise-grade login portal (Premium Light Editorial Theme).
 * * Scope:
 * - Enforces the 60/40 visual split (Left: Live News / Right: Network ID Auth).
 * - Triggers actual Keycloak OAuth via AuthContext.
 * * Critical Dependencies:
 * - Backend: getNewsHighlights (from ../../src/apiConfig)
 * - Ticker: GlobalMarketTicker (Dynamically imported)
 * - Auth: useAuth (from ../../src/context/AuthContext)
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Migrated from root landing page to dedicated /login route.
 * - EDITED: Updated relative imports (../src to ../../src).
 * - EDITED: Replaced mock login router.push with actual keycloak.login() integration.
 * - EDITED: Upgraded right-side login box typography to modern sans-serif tech aesthetics ("Treishvaam Network ID").
 * - EDITED: Expanded instructional copy for a premium institutional feel.
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getNewsHighlights } from '../../src/apiConfig';
import { useAuth } from '../../src/context/AuthContext';
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaRegClock, FaFingerprint } from 'react-icons/fa';

// Dynamically import the market ticker to prevent SSR hydration errors
const GlobalMarketTicker = dynamic(
    () => import('../../src/components/market/GlobalMarketTicker'),
    { ssr: false }
);

export default function LoginPage() {
    const [news, setNews] = useState<any[]>([]);
    const [newsIndex, setNewsIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Keycloak Auth Integration
    const { login } = useAuth();

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
        }, 7500);
        return () => clearInterval(interval);
    }, [news.length]);

    const handleLoginRedirect = () => {
        if (login) {
            login(); // Triggers Keycloak OAuth
        } else {
            console.warn("AuthContext not fully loaded or Keycloak missing. Falling back to default auth path.");
            router.push('/home');
        }
    };

    const currentArticle = news[newsIndex];

    return (
        <div className="min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-sky-200 selection:text-sky-900 relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8 flex flex-col">

            {/* =========================================
                GLOBAL MARKET TICKER (Absolute Top)
            ========================================= */}
            <div className="w-full border-b border-slate-200 bg-white z-50 relative shadow-sm">
                <GlobalMarketTicker />
            </div>

            {/* Subtle Architectural Grid & Modern Fintech Glows (Left Side) */}
            <div className="absolute inset-0 z-[0] opacity-[0.2] pointer-events-none w-[60%] hidden lg:block"
                style={{ backgroundImage: 'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)', backgroundSize: '4rem 4rem', maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
            </div>
            <div className="absolute top-10 -left-40 w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-20 left-1/4 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none z-0"></div>

            <div className="fixed top-0 right-0 w-[40%] h-full bg-slate-50/80 border-l border-slate-200/80 z-0 hidden lg:block backdrop-blur-3xl shadow-[inset_20px_0_40px_rgba(0,0,0,0.01)]"></div>

            <div className="flex-1 container mx-auto px-6 lg:px-12 flex flex-col justify-center py-12 lg:py-0 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT COLUMN: 60% - Modern Fintech Messaging & Glassmorphic Flasher */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-8">
                        <div className="flex items-center gap-3 mb-8 relative z-10">
                            <span className="w-10 h-[2px] bg-sky-700"></span>
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-[0.25em]">Treishvaam Intelligence</span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.2rem] font-serif font-medium text-slate-900 leading-[1.03] mb-8 tracking-tight relative z-10">
                            The Network for <br />
                            <span className="italic text-slate-500 font-light relative inline-block">
                                Intelligent
                                <span className="absolute bottom-1.5 left-0 w-full h-[4px] bg-sky-400/30 -z-10"></span>
                            </span> Capital.
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-600 mb-14 leading-relaxed max-w-xl font-light relative z-10">
                            High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                        </p>

                        <div className="w-full max-w-2xl relative z-10 backdrop-blur-xl bg-white/60 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] rounded-3xl p-8 min-h-[190px] overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-500 to-indigo-600"></div>

                            <div className="flex items-center justify-between mb-5 pl-2">
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                                    Live Global Briefing
                                </h2>
                            </div>

                            {loading ? (
                                <div className="space-y-4 animate-pulse pt-2 pl-2">
                                    <div className="h-5 bg-slate-200/60 rounded-md w-full"></div>
                                    <div className="h-5 bg-slate-200/60 rounded-md w-4/5"></div>
                                    <div className="h-3 bg-slate-200/40 rounded-md w-1/3 mt-5"></div>
                                </div>
                            ) : currentArticle ? (
                                <article key={newsIndex} className="animate-fade-in-right absolute left-10 right-8">
                                    <Link href="/home" className="block">
                                        <h3 className="text-xl lg:text-[1.55rem] font-serif font-medium text-slate-900 group-hover:text-sky-800 transition-colors leading-[1.35] line-clamp-3">
                                            {currentArticle.title || currentArticle.headline}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                                            {currentArticle.source && (
                                                <span className="text-slate-800 bg-white/50 px-2.5 py-1 rounded-md border border-slate-200/60 shadow-sm">
                                                    {typeof currentArticle.source === 'string' ? currentArticle.source : currentArticle.source.name}
                                                </span>
                                            )}
                                            {(currentArticle.publishedAt || currentArticle.createdAt) && (
                                                <span className="flex items-center gap-1.5 opacity-80">
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
                                <div className="text-sm text-slate-400 italic pt-2 pl-2">Awaiting live market data feeds...</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 40% - Trusted "Network ID" Pillowy Portal */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end mt-10 lg:mt-0">
                        <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 rounded-2xl p-8 lg:p-10 relative z-10 transition-all hover:shadow-slate-300/50">

                            {/* Modern Sans-Serif Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-md shadow-slate-900/20 mb-5 transition-transform hover:scale-105">
                                    <FaFingerprint className="text-lg" />
                                </div>
                                <h2 className="text-[1.65rem] font-sans font-extrabold tracking-tight text-slate-900 mb-2">Network ID</h2>
                                <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed">
                                    Authenticate via SSO to access institutional-grade analytics, custom portfolios, and premium intelligence.
                                </p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-800 text-sm font-semibold shadow-sm">
                                    <FaGoogle className="text-red-500 text-lg" /> Continue with Google
                                </button>
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-800 text-sm font-semibold shadow-sm">
                                    <FaLinkedinIn className="text-[#0077b5] text-lg" /> Continue with LinkedIn
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-800 text-sm font-semibold shadow-sm">
                                        <FaTwitter className="text-slate-900 text-lg" /> X
                                    </button>
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-800 text-sm font-semibold shadow-sm">
                                        <FaFacebookF className="text-[#1877f2] text-lg" /> Facebook
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2 mb-6">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Access</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group">
                                <div className="flex items-center gap-3">
                                    <FaChartLine className="text-emerald-400" />
                                    <span className="text-[11px] font-extrabold tracking-widest uppercase">Connect Terminal</span>
                                </div>
                                <FaArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                            </button>

                            <div className="mt-8 text-center">
                                <Link href="/home" className="text-xs font-bold text-slate-400 hover:text-sky-600 uppercase tracking-widest transition-colors inline-flex items-center gap-2 group">
                                    Explore as Guest
                                    <span className="w-4 h-[1px] bg-slate-200 group-hover:w-6 group-hover:bg-sky-600 transition-all"></span>
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