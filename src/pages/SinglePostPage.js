"use client";
/**
 * AI-CONTEXT:
 * Purpose: Client-side component for rendering a single blog/news post.
 * 
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: CRA original implementation.
 * - EDITED: Migrated from react-router-dom to Next.js navigation hooks.
 * - EDITED (Phase 2 Bug Fix): Fixed `reading 'id'` crash.
 * - EDITED (Phase 2 Followup): Reinstated deep null-guards and resolved form A11y warnings.
 * - EDITED (2026-05-15 BUG-SINGLEPOST-01): Regex extraction fixes.
 * - EDITED (HOTFIX - HYDRATION CRASH BATCH 3): Created strict `validHeadings` filter.
 * - EDITED (Hotfix - Hydration & Rendering Hardening): Replaced unsafe `typeof window` eval.
 * - EDITED (Phase 5 - Legacy Child Component Prop Injection): Injected `post={{ id: id || '', ...(post || {}) }}` defensively.
 * - EDITED (Phase 6 - Hydration Title Overwrite Protection): Appended dynamic title assert.
 * - EDITED (Phase 7 - Zero-Trust High Availability Preload Consumption): Consumed `window.__PRELOADED_STATE__`.
 * - EDITED (Phase 8 - Incident 118): Mounted `<RadarSidebar />` and sanitized `[object Object]` strings.
 * - EDITED (Phase 8 - Enterprise UX Integration): Wrapped prose in `AnnotationProvider` and `FloatingCalculator`.
 * - EDITED (Phase 8.1 - Enterprise UX Implementation): Decoupled `AnnotatableProse`.
 * - EDITED (Phase 8.3 - Left-Sticky Toolbar Integration):
 * • Restructured the main `<main>` container into a 3-column layout (`w-16` / `flex-1` / `w-[30%]`).
 * • Moved `<RadarSidebar />` from a globally floating element into a dedicated sticky-left container immediately beside the article headline for professional enterprise layout.
 *
 * - EDITED (Phase 8.8 - 3-Column Enterprise Alignment):
 * • Replaced `AnnotatableProse` inline embedding with dynamic external import.
 * • Refined the `xl:flex-row` boundaries to ensure the 16-pixel margin locks the sticky capsule flawlessly aligned to the left of the `h1` headline.
 *
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostByUrlId, API_URL } from '../apiConfig';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag, Loader2, BookmarkPlus } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';
import RadarSidebar from '../components/RadarSidebar';
import SmartMediaRenderer from '../components/BlogPage/SmartMediaRenderer';
import { AnnotationProvider } from '../context/AnnotationContext';
import CanvasOverlay from '../components/annotations/CanvasOverlay';
import FloatingCalculator from '../components/annotations/FloatingCalculator';
import AnnotatableProse from '../components/annotations/AnnotatableProse';

const SinglePostPage = () => {
    const params = useParams();
    const id = params?.id;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const [activeId, setActiveId] = useState('');
    const [progress, setProgress] = useState(0);
    const [clientUrl, setClientUrl] = useState('');
    const articleRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setClientUrl(window.location.href);
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        let isMounted = true;

        if (typeof window !== 'undefined' && window.__PRELOADED_STATE__) {
            const preloaded = window.__PRELOADED_STATE__;
            if (preloaded.id == id || preloaded.urlArticleId == id || preloaded.userFriendlySlug == id) {
                setPost(preloaded);
                setLoading(false);
                return;
            }
        }

        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getPostByUrlId(id);
                if (isMounted) {
                    if (response?.data && typeof response.data === 'object') {
                        setPost(response.data);
                    } else {
                        setError("Article not found or returned an invalid response.");
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load article. It may have been removed or the server is unavailable.");
                    setLoading(false);
                }
            }
        };

        fetchPost();
        return () => { isMounted = false; };
    }, [id]);

    useEffect(() => {
        if (post?.title) {
            const timer = setTimeout(() => {
                document.title = `${post.title} | Treishvaam Finance`;
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [post?.title]);

    const extractedHeadings = useMemo(() => {
        if (!post || !post.content || typeof post.content !== 'string') return [];
        const regex = /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi;
        let match;
        const headings = [];
        try {
            while ((match = regex.exec(post.content)) !== null) {
                if (!match[3]) continue;
                const level = parseInt(match[1], 10);
                const rawInner = match[3];
                const text = rawInner.replace(/<[^>]+>/g, '').trim();
                if (!text) continue;

                const idMatch = match[2] ? match[2].match(/id=["']([^"']+)["']/) : null;
                const headingId = idMatch ? idMatch[1] : text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                if (!headingId || typeof headingId !== 'string' || headingId.length === 0) continue;
                headings.push({ id: headingId, text, level });
            }
        } catch (e) {
            return [];
        }
        return headings;
    }, [post]);

    const validHeadings = useMemo(() => {
        if (!extractedHeadings || !Array.isArray(extractedHeadings)) return [];
        return extractedHeadings.filter(h => h && typeof h === 'object' && typeof h.id === 'string' && h.id.trim() !== '');
    }, [extractedHeadings]);

    const sanitizedContent = useMemo(() => {
        if (!post || !post.content || typeof post.content !== 'string') return '';
        return post.content.replace(/src="\[object Object\]"/g, 'src=""');
    }, [post?.content]);

    useEffect(() => {
        const handleScroll = () => {
            if (!articleRef.current) return;
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, scrolled)));

            if (!validHeadings || validHeadings.length === 0) {
                setActiveId('');
                return;
            }

            let currentActiveId = validHeadings[0].id;
            for (const heading of validHeadings) {
                const element = document.getElementById(heading.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        currentActiveId = heading.id;
                    } else {
                        break;
                    }
                }
            }
            setActiveId(currentActiveId);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [validHeadings]);

    if (loading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <Loader2 className="h-10 w-10 animate-spin text-sky-600 mb-4" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Loading Article...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors duration-300">
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-8 rounded-2xl max-w-md text-center border border-red-100 dark:border-red-800">
                    <h2 className="text-2xl font-bold mb-3">Article Not Found</h2>
                    <p className="mb-6 opacity-80">{error || "This article could not be loaded."}</p>
                    <Link href="/home" className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold bg-white dark:bg-slate-800 px-6 py-2 rounded-full shadow-sm">
                        <ArrowLeft size={16} className="mr-2" /> Back to Feed
                    </Link>
                </div>
            </div>
        );
    }

    const categoryName = post?.category?.name || 'Uncategorized';
    const categorySlug = post?.category?.slug || 'general';
    const authorName = post?.author || post?.authorName || 'Treishvaam Editorial';

    let publishDate = 'N/A';
    if (post?.createdAt) {
        const d = new Date(post.createdAt);
        if (!isNaN(d.getTime())) {
            publishDate = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }

    const postUrl = clientUrl || `https://treishvaamfinance.com/category/${categorySlug}/${post?.userFriendlySlug}/${post?.urlArticleId}`;

    const activeImage = post?.coverImageUrl || post?.thumbnailUrl;
    let coverImageUrl = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';
    if (activeImage && typeof activeImage === 'string') {
        if (activeImage.startsWith('http') || activeImage.startsWith('/')) {
            coverImageUrl = activeImage;
        } else if (activeImage.endsWith('.mp4') || activeImage.endsWith('.m3u8') || activeImage.includes('/raw/') || activeImage.includes('/hls/')) {
            coverImageUrl = `${API_URL}/${activeImage.replace(/^\/+/, '')}`;
        } else {
            coverImageUrl = `${API_URL}/api/v1/files/download/${activeImage}`;
        }
    }

    const imageAltText = post?.coverImageAltText || post?.thumbnailAltText || post?.title || 'Article cover image';
    const defensivePostProp = { id: id || '', ...(post || {}) };

    return (
        <AnnotationProvider articleId={id}>
            <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300 relative">
                {validHeadings.length > 0 && (
                    <ReadingProgressBar
                        post={defensivePostProp}
                        headings={validHeadings}
                        activeId={activeId}
                        progress={progress}
                    />
                )}

                <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* 3-Column Enterprise Layout: Left Sticky Toolbar | Main Article | Right Sidebar */}
                    <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 relative">

                        {/* 1. LEFT STICKY TOOLBAR (Desktop Only - perfectly aligned to headline) */}
                        <div className="hidden xl:block w-14 flex-shrink-0 relative z-50">
                            <div className="sticky top-32">
                                <RadarSidebar />
                            </div>
                        </div>

                        {/* 2. MAIN ARTICLE */}
                        <article className="flex-1 min-w-0 relative max-w-3xl" ref={articleRef}>
                            <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 space-x-2">
                                <Link href="/home" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Home</Link>
                                <span>/</span>
                                <span className="text-sky-700 dark:text-sky-500">{categoryName}</span>
                            </nav>

                            <header className="mb-8 relative z-20">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight font-serif mb-6">
                                    {post.title}
                                </h1>
                                <div className="flex flex-wrap items-center justify-between border-y border-slate-200 dark:border-slate-800 py-4 gap-4">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center font-semibold">
                                            <User className="w-4 h-4 mr-2 text-sky-600 dark:text-sky-400" />
                                            {authorName}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {publishDate}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            {post?.estimatedReadingTime || 5} min read
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                                            title="Save to Bookmarks"
                                        >
                                            <BookmarkPlus className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setIsShareModalOpen(true)}
                                            className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-full transition-colors"
                                        >
                                            <Share2 className="w-4 h-4 mr-2" /> Share
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {activeImage && (
                                <figure className="mb-10 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative z-20">
                                    <SmartMediaRenderer
                                        mediaUrl={coverImageUrl}
                                        alt={imageAltText}
                                        layoutContext="article"
                                        className="w-full h-auto max-h-[500px] object-cover"
                                    />
                                    {imageAltText && imageAltText !== post.title && imageAltText !== 'Article cover image' && (
                                        <figcaption className="text-center text-xs text-slate-500 mt-3 italic">
                                            {imageAltText}
                                        </figcaption>
                                    )}
                                </figure>
                            )}

                            {/* Mobile Toolbar Fallback (Fixed Bottom Right) */}
                            <div className="block xl:hidden">
                                <RadarSidebar />
                            </div>

                            <div className="relative">
                                <CanvasOverlay />
                                <FloatingCalculator />
                                <AnnotatableProse content={sanitizedContent} />
                            </div>

                            {Array.isArray(post?.tags) && post.tags.length > 0 && (
                                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 relative z-20">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center">
                                        <Tag className="w-4 h-4 mr-2" /> Topics
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </article>

                        {/* 3. RIGHT SIDEBAR */}
                        <aside className="hidden lg:block w-full lg:w-[30%] max-w-sm flex-shrink-0 relative z-20">
                            <div className="sticky top-24 space-y-8">
                                {validHeadings.length > 0 && (
                                    <TableOfContents
                                        post={defensivePostProp}
                                        headings={validHeadings}
                                        activeId={activeId}
                                        progress={progress}
                                    />
                                )}
                                <div className="bg-sky-50 dark:bg-slate-800 p-6 rounded-2xl border border-sky-100 dark:border-slate-700 shadow-sm">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 font-serif">
                                        Stay Ahead of the Market
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        Get institutional-grade analysis delivered directly to your inbox.
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="newsletter-email" className="sr-only">Email Address</label>
                                        <input
                                            id="newsletter-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                        />
                                        <button className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
                                            Subscribe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <ShareModal
                    post={defensivePostProp}
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    url={postUrl}
                    title={post?.title || ''}
                />
            </div>
        </AnnotationProvider>
    );
};

export default SinglePostPage;