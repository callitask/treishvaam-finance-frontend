"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNewsHighlights } from '../apiConfig';
import { FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter, FaChartLine, FaArrowRight, FaLock, FaRegClock } from 'react-icons/fa';

/**
 * AI-CONTEXT:
 * Purpose: Public Entry Point (Root "/"). Enterprise-grade financial journalism landing page.
 * Scope: Strictly meant for SEO and secure portal access.
 * Critical Dependencies:
 * - Backend: getNewsHighlights
 * * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link and next/navigation.
 * - EDITED: Redesigned Hero to 60/40 split, removing noise, removing CategoryStrip.
 * - EDITED: Shifted login portal to the right column.
 * - EDITED: Replaced simulated terminal with Live News Flasher (getNewsHighlights).
 * - EDITED: Removed mock data/fake fallbacks to enforce enterprise data integrity.
 */
const LandingPage = () => {
    const [news, setNews] = useState([]);
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
        }, 6000); // 6 seconds per headline
        return () => clearInterval(interval);
    }, [news.length]);

    const handleLoginRedirect = () => {
        router.push('/login');
    };

    const currentArticle = news[newsIndex];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-slate-200 selection:text-slate-900">
            {/* Clean Enterprise Background Split */}
            <div className="fixed inset-0 bg-[#fdfdfd] -z-20"></div>
            <div className="fixed top-0 right-0 w-[40%] h-full bg-slate-50 border-l border-slate-200/60 -z-10 hidden lg:block"></div>

            <div className="container mx-auto px-6 lg:px-12 min-h-screen flex flex-col justify-center py-10 lg:py-0">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

                    {/* LEFT COLUMN: 60% - Corporate Messaging & News Flasher */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-center animate-fade-in-up pr-0 lg:pr-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-8 h-[1px] bg-slate-400"></span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Treishvaam Global</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-medium text-slate-900 leading-[1.05] mb-6 tracking-tight">
                            The Network for <br /><span className="italic text-slate-500">Intelligent</span> Capital.
                        </h1>
                        <p className="text-lg text-slate-600 mb-12 leading-relaxed max-w-xl font-light">
                            High-signal, low-noise financial intelligence. Gain immediate access to institutional-grade market analysis, macroeconomic insights, and real-time geopolitical developments.
                        </p>

                        {/* Live News Flasher (Fixed Height to prevent CLS) */}
                        <div className="w-full max-w-2xl border-t-2 border-slate-900 pt-6 mt-4 relative min-h-[140px]">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                    Live Briefing
                                </h2>
                                <Link href="/home" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest transition-colors">
                                    View All Markets &rarr;
                                </Link>
                            </div>

                            {loading ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            ) : currentArticle ? (
                                <article key={newsIndex} className="animate-fade-in-right absolute left-0 right-0">
                                    <Link href="/home" className="group block">
                                        <h3 className="text-xl lg:text-2xl font-serif font-medium text-slate-900 group-hover:text-sky-800 transition-colors leading-snug line-clamp-2">
                                            {currentArticle.title || currentArticle.headline}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                                            {currentArticle.source && (
                                                <span className="uppercase tracking-wider text-slate-700">
                                                    {typeof currentArticle.source === 'string' ? currentArticle.source : currentArticle.source.name}
                                                </span>
                                            )}
                                            {(currentArticle.publishedAt || currentArticle.createdAt) && (
                                                <span className="flex items-center gap-1.5">
                                                    <FaRegClock />
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
                                <div className="text-sm text-slate-400 italic">Awaiting live market data...</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 40% - Login / Secure Access Portal */}
                    <div className="w-full lg:w-[40%] flex justify-center lg:justify-end">
                        <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-xl p-8 lg:p-10 relative z-10">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 mb-4">
                                    <FaLock className="text-slate-400 text-lg" />
                                </div>
                                <h2 className="text-2xl font-serif font-medium text-slate-900 mb-2">Secure Access</h2>
                                <p className="text-sm text-slate-500">Authenticate to enter the private network.</p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium">
                                    <FaGoogle className="text-red-500" /> Continue with Google
                                </button>
                                <button onClick={handleLoginRedirect} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium">
                                    <FaLinkedinIn className="text-[#0077b5]" /> Continue with LinkedIn
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium">
                                        <FaTwitter className="text-slate-900" /> X
                                    </button>
                                    <button onClick={handleLoginRedirect} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-all text-slate-700 text-sm font-medium">
                                        <FaFacebookF className="text-[#1877f2]" /> Facebook
                                    </button>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2 mb-6">
                                <div className="flex-grow border-t border-slate-100"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Sign-In</span>
                                <div className="flex-grow border-t border-slate-100"></div>
                            </div>

                            <button onClick={handleLoginRedirect} className="w-full flex items-center justify-between px-6 py-4 bg-slate-900 text-white rounded hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 group">
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
                .animate-fade-in-right { animation: fade-in-right 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
            `}</style>
        </div>
    );
};

export default LandingPage;