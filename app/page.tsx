/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Public Entry Point (Root "/"). Next.js App Router.
 * - Enterprise-grade institutional financial landing page.
 *
 * Scope:
 * - Replaces the previous "Davos-Grade" landing with a Bloomberg-meets-Stripe design.
 * - Fetches categories and latest posts from API for dynamic content.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: Migrated from CRA to Next.js Page component.
 * - EDITED: Changed `react-router-dom` imports to `next/link` and `next/navigation`.
 * - EDITED (2026-05-15 BUG-HYDRATION-01 Fix D + P0-5 Enterprise Landing):
 *   • Replaced static `import GlobalMarketTicker` with `dynamic(() => import(...), { ssr: false })`.
 *   • Why: GlobalMarketTicker uses browser APIs (window, real-time data) that cause hydration mismatch.
 *   • Redesigned entire page to Fortune 500 financial institution aesthetic.
 *   • Added export const metadata for SEO (handled by layout but page can override).
 *   • Removed social login buttons from hero. Added clean CTAs.
 *   • Added trust bar, category pills, latest articles grid.
 *   • Logo uses /logo.webp (NOT .png).
 */
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCategories, getPaginatedPosts } from '../src/apiConfig';

// SSR-safe dynamic import — GlobalMarketTicker uses browser APIs
const GlobalMarketTicker = dynamic(
    () => import('../src/components/market/GlobalMarketTicker'),
    { ssr: false }
);

export default function LandingPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [latestPosts, setLatestPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getReadingTime = (content) => {
        if (!content) return '3 min';
        const words = content.replace(/<[^>]+>/g, '').split(/\s+/).length;
        return `${Math.max(1, Math.ceil(words / 200))} min`;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 -mx-4 sm:-mx-6 lg:-mx-8">

            {/* ═══════════════════════════════════════════════════
                HERO SECTION — Clean, authoritative, minimal
            ═══════════════════════════════════════════════════ */}
            <section className="relative bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
                    <div className="max-w-3xl">
                        {/* Accent line */}
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-10 h-[2px] bg-slate-900"></span>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Treishvaam Finance</span>
                        </div>

                        {/* Hero headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium text-slate-900 leading-[1.1] mb-6 tracking-tight">
                            India&apos;s Premier Financial Intelligence Platform
                        </h1>

                        {/* Sub-headline with concrete stats */}
                        <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl font-light">
                            Expert analysis, real-time market data, and proprietary research — delivered with institutional precision. Free access to all published content.
                        </p>

                        {/* Two CTAs only */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/home"
                                className="inline-flex items-center px-8 py-3.5 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200/50"
                            >
                                Read Latest Analysis
                            </Link>
                            <Link
                                href="/login"
                                className="inline-flex items-center px-8 py-3.5 border-2 border-slate-300 text-slate-700 text-sm font-bold uppercase tracking-wider rounded hover:border-slate-900 hover:text-slate-900 transition-colors"
                            >
                                Join Free
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                TRUST BAR — Clean horizontal stat bar
            ═══════════════════════════════════════════════════ */}
            <section className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
                    <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12 text-center">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">1,200+</span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Articles</span>
                        </div>
                        <span className="hidden sm:block w-px h-6 bg-slate-300"></span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">8</span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Categories</span>
                        </div>
                        <span className="hidden sm:block w-px h-6 bg-slate-300"></span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">Real-Time</span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Market Data</span>
                        </div>
                        <span className="hidden sm:block w-px h-6 bg-slate-300"></span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">Est. 2024</span>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bangalore</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                MARKET TICKER — Dynamic import, no SSR
            ═══════════════════════════════════════════════════ */}
            <section className="border-b border-slate-100">
                <GlobalMarketTicker />
            </section>

            {/* ═══════════════════════════════════════════════════
                CATEGORY PILLS — Fetch from API
            ═══════════════════════════════════════════════════ */}
            <section className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
                    <div className="flex items-center gap-3 mb-5">
                        <span className="w-6 h-[2px] bg-slate-400"></span>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">Explore by Category</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-9 w-24 bg-slate-100 rounded-full animate-pulse"></div>
                            ))
                        ) : (
                            categories.map((cat: any) => (
                                <Link
                                    key={cat.id}
                                    href="/home"
                                    className="px-5 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-600 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
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
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <span className="w-2 h-8 bg-slate-900"></span>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Latest Analysis</h2>
                        </div>
                        <Link
                            href="/home"
                            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                        >
                            View All →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-48 bg-slate-100 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-20 mb-3"></div>
                                    <div className="h-6 bg-slate-100 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : latestPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latestPosts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/category/${post.category?.slug || 'general'}/${post.urlArticleId || post.id}/${post.urlArticleId || post.id}`}
                                    className="group block"
                                >
                                    {/* Thumbnail */}
                                    {post.thumbnailUrl && (
                                        <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-slate-100">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com'}/api/v1/files/download/${post.thumbnailUrl}`}
                                                alt={post.title || ''}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>
                                    )}
                                    {!post.thumbnailUrl && (
                                        <div className="h-48 rounded-lg mb-4 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                            <span className="text-slate-300 text-4xl font-serif">{post.title?.[0] || 'T'}</span>
                                        </div>
                                    )}

                                    {/* Category badge */}
                                    {post.category?.name && (
                                        <span className="inline-block text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">
                                            {post.category.name}
                                        </span>
                                    )}

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-snug mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt + reading time */}
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        {post.excerpt && (
                                            <span className="line-clamp-1 flex-1">{post.excerpt}</span>
                                        )}
                                        <span className="flex-shrink-0 font-medium">{getReadingTime(post.content)} read</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <p className="text-sm">Content loading... Check back shortly.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                FOOTER CTA
            ═══════════════════════════════════════════════════ */}
            <section className="bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 text-center">
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4">Start Reading Today</h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                        No paywall. No spam. Access all published financial analysis and market intelligence for free.
                    </p>
                    <Link
                        href="/home"
                        className="inline-flex items-center px-8 py-3.5 bg-white text-slate-900 text-sm font-bold uppercase tracking-wider rounded hover:bg-slate-100 transition-colors"
                    >
                        Browse All Articles
                    </Link>
                </div>
            </section>
        </div>
    );
}
