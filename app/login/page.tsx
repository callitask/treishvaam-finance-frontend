/**
 * AI-CONTEXT:
 * Purpose: Dedicated Authentication Hub ("/login"). Next.js App Router.
 * Scope:
 * - Strictly meant for SEO and secure portal access.
 * - Enforces the 60/40 visual split (Left: Live News / Right: Auth).
 * Critical Dependencies:
 * - Backend: getNewsHighlights (from ../../src/apiConfig)
 * - Auth: useAuth (from ../../src/context/AuthContext)
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Overwrote legacy dark theme with premium light editorial design (Bloomberg/Mint style).
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
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaRegClock } from 'react-icons/fa';

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
        if (login) {
            login(); // Triggers the real authentication flow
        } else {
            console.warn("AuthContext not fully loaded or Keycloak missing.");
            router.push('/home');
        }
    };

    const currentArticle = news[newsIndex];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900 relative overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">

            {/* Subtle Architectural Grid on Left (Enterprise Aesthetic) */}
            <div className="absolute inset-0 z-[0] opacity-[0.15] pointer-events-none w-[60%] hidden lg:block"
                style={{ backgroundImage: 'linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)', backgroundSize: '4rem 4rem', maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)' }}>
            </div>

            {/* Solid Right Column Background */}
            <div className="fixed top-0 right-0 w-[40%] h-full bg-slate-50 border-l border-slate-200/80 -z-10 hidden lg:block shadow-[inset_20px_0_40px_rgba(0,0,0,0.01)]"></div>

            <div className="container mx-auto px-6 lg:px-12 min-h-screen flex flex-col justify-center py-12 lg:py-0 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* LEFT COLUMN: 60% - Editorial Messaging & News Flasher */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-8">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-[2px] bg-slate-900"></span>
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Treishvaam Global Terminal</span>
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

                    {/* RIGHT COLUMN: 40% - Login / Secure Access Portal */}
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
                @keyframes fade-in-right { 0% { opacity: 0; transform: translateX(-15px); } 100% { opacity: 1; transform: translateX(0); } }
                .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
                .animate-fade-in-right { animation: fade-in-right 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}