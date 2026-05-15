/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Public Entry Point (Root "/"). Next.js App Router.
 * - Modern financial news landing page — Moneycontrol/ET Markets aesthetic.
 * - Two-column hero: left = animated stats/news ticker, right = auth + market access.
 * - GlobalMarketTicker directly below Navbar (no gap).
 *
 * Scope:
 * - Replaces `src/pages/LandingPage.js`.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Changed `react-router-dom` imports to `next/link` and `next/navigation`.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix D + P0-5 Enterprise Landing):
 *   • Replaced static import GlobalMarketTicker with dynamic({ ssr: false }).
 *   • Redesigned to Fortune 500 financial institution aesthetic.
 * - EDITED (2026-05-15 Landing Page Redesign v2):
 *   • Restored original two-column layout: left = animated hero, right = social login + access.
 *   • GlobalMarketTicker moved to top (directly below Navbar, no gap).
 *   • Left column: animated live market stats, scrolling news headlines, brand identity.
 *   • Right column: social login buttons (Google, LinkedIn, Twitter, Facebook) + "Access Platform" skip.
 *   • All social logins redirect to /login (Keycloak handles OAuth — free, no paid APIs needed).
 *   • Added category pills and latest articles below hero.
 *   • Logo uses /logo.webp (NOT .png).
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { getCategories, getPaginatedPosts } from '../src/apiConfig';
import {
    FaGoogle, FaFacebookF, FaLinkedinIn, FaTwitter,
    FaChartLine, FaArrowRight, FaArrowUp, FaArrowDown,
    FaLock, FaGlobe, FaBolt
} from 'react-icons/fa';

// SSR-safe dynamic import — GlobalMarketTicker uses browser APIs
const GlobalMarketTicker = dynamic(
    () => import('../src/components/market/GlobalMarketTicker'),
    { ssr: false }
);

// Animated live stat card
const StatCard = ({ label, value, change, isPositive }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/60 last:border-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-20 flex-shrink-0">{label}</span>
        <span className="text-sm font-mono font-bold text-white">{value}</span>
        <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <FaArrowUp className="text-[8px]" /> : <FaArrowDown className="text-[8px]" />}
            {change}
        </span>
    </div>
);

// Scrolling news headline ticker
const HEADLINES = [
    "RBI holds repo rate at 6.5% — markets react positively",
    "Sensex crosses 80,000 mark for the first time",
    "Q4 results: IT sector beats estimates across the board",
    "FII inflows surge ₹12,000 Cr in May 2026",
    "Gold hits ₹75,000 per 10g amid global uncertainty",
    "SEBI tightens F&O rules — retail participation drops",
    "Budget 2026: Capital gains tax revised for equity investors",
    "Nifty Bank index outperforms broader market this week",
];

export default function LandingPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [headlineIndex, setHeadlineIndex] = useState(0);
    const [headlineFade, setHeadlineFade] = useState(true);
    const router = useRouter();

    // Rotate headlines every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHeadlineFade(false);
            setTimeout(() => {
                setHeadlineIndex(i => (i + 1) % HEADLINES.length);
                setHeadlineFade(true);
            }, 300);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, postsRes] = await Promise.allSettled([
                    getCategories(),
                    getPaginatedPosts(0, 6)
                ]);
                if (catRes.status === 'fulfilled' && catRes.value.data) {
                    setCategories(catRes.value.data.slice(0, 8));
                }
                if (postsRes.status === 'fulfilled' && postsRes.value.data) {
                    const posts = postsRes.value.data.content || postsRes.value.data;
                    setLatestPosts(Array.isArray(posts) ? posts.slice(0, 6) : []);
                }
            } catch (error) {
                console.error("[Landing] Data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLoginRedirect = () => router.push('/login');

    const getReadingTime = (content: any) => {
        if (!content) return '3 min';
        const words = String(content).replace(/<[^>]+>/g, '').split(/\s+/).length;
        return `${Math.max(1, Math.ceil(words / 200))} min`;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 -mx-4 sm:-mx-6 lg:-mx-8">

            {/* ═══════════════════════════════════════════════════
                GLOBAL MARKET TICKER — directly below Navbar, no gap
            ═══════════════════════════════════════════════════ */}
            <div className="w-full border-b border-slate-200 bg-white">
                <GlobalMarketTicker />
            </div>

            {/* ═══════════════════════════════════════════════════
                HERO SECTION — Two column layout
                LEFT: Animated market stats + brand
                RIGHT: Social login + platform access
            ═══════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden">
                {/* Dark left panel background */}
                <div className="absolute inset-y-0 left-0 w-full lg:w-[48%] bg-slate-900 z-0"></div>
                {/* Subtle grid pattern on dark side */}
                <div className="absolute inset-y-0 left-0 w-full lg:w-[48%] z-0 opacity-10"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-12">
                    <div className="flex flex-col lg:flex-row min-h-[580px]">

                        {/* ─── LEFT COLUMN: Brand + Live Stats + Headlines ─── */}
                        <div className="w-full lg:w-[48%] py-12 lg:py-16 pr-0 lg:pr-12 flex flex-col justify-between">

                            {/* Brand identity */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">Live Markets</span>
                                </div>

                                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-4 tracking-tight">
                                    India&apos;s Market<br />
                                    <span className="text-emerald-400">Intelligence</span> Hub
                                </h1>

                                <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md">
                                    Real-time market data, expert analysis, and financial news — everything that moves the market, in one place.
                                </p>

                                {/* Scrolling headline */}
                                <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 mb-8">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FaBolt className="text-yellow-400 text-xs" />
                                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Breaking</span>
                                    </div>
                                    <p className={`text-sm text-white font-medium transition-opacity duration-300 ${headlineFade ? 'opacity-100' : 'opacity-0'}`}>
                                        {HEADLINES[headlineIndex]}
                                    </p>
                                </div>
                            </div>

                            {/* Live market mini-terminal */}
                            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Snapshot</span>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                                <StatCard label="NIFTY 50" value="24,832" change="+0.82%" isPositive={true} />
                                <StatCard label="SENSEX" value="81,456" change="+0.74%" isPositive={true} />
                                <StatCard label="NIFTY BK" value="52,140" change="-0.21%" isPositive={false} />
                                <StatCard label="USD/INR" value="83.42" change="+0.12%" isPositive={false} />
                                <p className="text-[9px] text-slate-600 mt-2 text-right">Indicative. Live data on platform.</p>
                            </div>
                        </div>

                        {/* ─── RIGHT COLUMN: Auth + Platform Access ─── */}
                        <div className="w-full lg:w-[52%] bg-white py-12 lg:py-16 pl-0 lg:pl-12 flex flex-col justify-center">

                            <div className="max-w-md w-full mx-auto lg:mx-0">

                                {/* Header */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Join Treishvaam Finance</h2>
                                    <p className="text-slate-500 text-sm">Sign in to access your watchlist, portfolio tools, and personalized feed.</p>
                                </div>

                                {/* Social Login Buttons */}
                                <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm mb-5">
                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                                            <FaLock className="text-slate-300 text-xs" /> Sign in with
                                        </h3>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">FREE</span>
                                    </div>

                                    {/* Social Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium text-slate-700"
                                        >
                                            <FaGoogle className="text-red-500" />
                                            Google
                                        </button>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium text-slate-700"
                                        >
                                            <FaLinkedinIn className="text-[#0077b5]" />
                                            LinkedIn
                                        </button>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium text-slate-700"
                                        >
                                            <FaTwitter className="text-slate-800" />
                                            X / Twitter
                                        </button>
                                        <button
                                            onClick={handleLoginRedirect}
                                            className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all text-sm font-medium text-slate-700"
                                        >
                                            <FaFacebookF className="text-[#1877f2]" />
                                            Facebook
                                        </button>
                                    </div>

                                    {/* Primary CTA */}
                                    <button
                                        onClick={handleLoginRedirect}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FaChartLine className="text-emerald-400" />
                                            <span className="text-sm font-bold">Sign In / Create Account</span>
                                        </div>
                                        <FaArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>

                                {/* Skip login — Access Platform */}
                                <div className="flex items-center justify-between px-1">
                                    <Link
                                        href="/home"
                                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-sky-700 transition-colors group"
                                    >
                                        <FaGlobe className="text-slate-400 group-hover:text-sky-600" />
                                        Access Market Platform
                                        <span className="w-4 h-[1px] bg-slate-300 group-hover:w-8 group-hover:bg-sky-700 transition-all"></span>
                                    </Link>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Login Required</span>
                                </div>

                                {/* Trust signals */}
                                <div className="mt-6 pt-5 border-t border-slate-100">
                                    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                                        <span>✓ 1,200+ Articles</span>
                                        <span>✓ Real-Time Data</span>
                                        <span>✓ Free Access</span>
                                        <span>✓ No Spam</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                CATEGORY PILLS
            ═══════════════════════════════════════════════════ */}
            <section className="bg-slate-50 border-y border-slate-100">
                <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-5">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Topics:</span>
                        <Link href="/home" className="px-4 py-1.5 rounded-full border border-slate-300 text-xs font-bold text-slate-700 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                            All Markets
                        </Link>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-7 w-20 bg-slate-200 rounded-full animate-pulse"></div>
                            ))
                        ) : (
                            categories.map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    href="/home"
                                    className="px-4 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all"
                                >
                                    {cat.name}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                LATEST ARTICLES — 3-column grid
            ═══════════════════════════════════════════════════ */}
            <section className="bg-white">
                <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-12">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-sky-700 rounded-full"></span>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Latest Analysis</h2>
                        </div>
                        <Link href="/home" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider">
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-44 bg-slate-100 rounded-lg mb-3"></div>
                                    <div className="h-3 bg-slate-100 rounded w-16 mb-2"></div>
                                    <div className="h-5 bg-slate-100 rounded w-full mb-1"></div>
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : latestPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {latestPosts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/category/${post.category?.slug || 'general'}/${post.userFriendlySlug || post.urlArticleId || post.id}/${post.urlArticleId || post.id}`}
                                    className="group block border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {post.thumbnailUrl ? (
                                        <div className="h-44 overflow-hidden bg-slate-100">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com'}/api/v1/files/download/${post.thumbnailUrl}`}
                                                alt={post.title || ''}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                            <span className="text-slate-300 text-5xl font-serif">{post.title?.[0] || 'T'}</span>
                                        </div>
                                    )}
                                    <div className="p-4">
                                        {post.category?.name && (
                                            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1 block">
                                                {post.category.name}
                                            </span>
                                        )}
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium">{getReadingTime(post.content)} read</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-sm">
                            Loading latest articles...
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}
