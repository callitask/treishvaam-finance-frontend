"use client";
/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Client-side component for rendering a single blog/news post.
 * - Fetches post data by URL ID from the backend API and renders the full article view.
 *
 * Scope:
 * - Responsible for: post data fetching, article rendering, reading progress, table of contents.
 *
 * Critical Dependencies:
 * - Backend: NEXT_PUBLIC_API_URL → /api/v1/posts/url/:id (via apiConfig.getPostByUrlId)
 *
 * Change Intent:
 * - Reinstated strict null-guards for `extractedHeadings` to prevent the `reading 'id'` crash.
 * - Added `id`, `name`, and `<label>` attributes to the subscription form to fix accessibility warnings.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED: CRA original implementation.
 * - EDITED: Migrated from react-router-dom to Next.js navigation hooks.
 * - EDITED (Phase 2 Bug Fix): Fixed `reading 'id'` crash.
 * - EDITED (Phase 2 Followup): Reinstated deep null-guards and resolved form A11y warnings.
 * - EDITED (2026-05-15 BUG-SINGLEPOST-01):
 * • Root cause: extractedHeadings useMemo was producing objects where `headingId` could be
 * an empty string or undefined when heading text was empty or regex group 3 was undefined.
 * TableOfContents and ReadingProgressBar then crashed accessing `.id` on undefined elements.
 * • Fix: Added triple null-guard: (1) check match[3] exists before processing, (2) only push
 * headings where headingId is a non-empty string, (3) added optional chaining throughout.
 * • Also fixed: post.content could be null/undefined causing regex to crash — added early return.
 * * - EDITED (HOTFIX - HYDRATION CRASH):
 * • Completely secured `.id` access inside the scroll listener to prevent Next.js client-side exceptions.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getPostByUrlId, API_URL } from '../apiConfig';
import { Calendar, User, ArrowLeft, Clock, Share2, Tag, Loader2, BookmarkPlus } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import ReadingProgressBar from '../components/ReadingProgressBar';
import TableOfContents from '../components/TableOfContents';

const SinglePostPage = () => {
    const params = useParams();
    const id = params?.id;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const [activeId, setActiveId] = useState('');
    const [progress, setProgress] = useState(0);

    const articleRef = useRef(null);

    useEffect(() => {
        if (!id) return;

        let isMounted = true;
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
                console.error("[SinglePostPage] Failed to fetch post:", err);
                if (isMounted) {
                    setError("Failed to load article. It may have been removed or the server is unavailable.");
                    setLoading(false);
                }
            }
        };

        fetchPost();

        return () => { isMounted = false; };
    }, [id]);

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
                const headingId = idMatch
                    ? idMatch[1]
                    : text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

                if (!headingId || typeof headingId !== 'string' || headingId.length === 0) continue;

                headings.push({ id: headingId, text, level });
            }
        } catch (e) {
            console.error('[SinglePostPage] extractedHeadings error:', e);
            return [];
        }
        return headings;
    }, [post]);

    useEffect(() => {
        const handleScroll = () => {
            if (!articleRef.current) return;

            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            setProgress(Math.min(100, Math.max(0, scrolled)));

            // FIX: Guaranteed, fail-safe guard against undefined arrays or array elements without IDs
            if (!extractedHeadings || !Array.isArray(extractedHeadings) || extractedHeadings.length === 0) {
                setActiveId('');
                return;
            }

            const firstHeading = extractedHeadings[0];
            if (!firstHeading || typeof firstHeading.id === 'undefined') {
                setActiveId('');
                return;
            }

            let currentActiveId = firstHeading.id;
            for (const heading of extractedHeadings) {
                if (!heading || typeof heading.id === 'undefined') continue;
                
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
    }, [extractedHeadings]);

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
    const authorName = post?.authorName || 'Treishvaam Editorial';
    const publishDate = post?.createdAt
        ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const postUrl = typeof window !== 'undefined'
        ? window.location.href
        : `https://treishvaamfinance.com/category/${categorySlug}/${post?.userFriendlySlug}/${post?.urlArticleId}`;

    const coverImageUrl = post?.thumbnailUrl
        ? `${API_URL}/api/v1/files/download/${post.thumbnailUrl}`
        : 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';

    return (
        <div className="bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
            {extractedHeadings?.length > 0 && (
                <ReadingProgressBar headings={extractedHeadings} activeId={activeId} progress={progress} />
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    <article className="w-full lg:w-[70%]" ref={articleRef}>
                        <nav className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 space-x-2">
                            <Link href="/home" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-sky-700 dark:text-sky-500">{categoryName}</span>
                        </nav>
                        <header className="mb-8">
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

                        {post?.thumbnailUrl && (
                            <figure className="mb-10">
                                <img
                                    src={coverImageUrl}
                                    alt={post?.thumbnailAltText || post?.title || 'Article cover image'}
                                    className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
                                />
                                {post?.thumbnailAltText && (
                                    <figcaption className="text-center text-xs text-slate-500 mt-3 italic">
                                        {post.thumbnailAltText}
                                    </figcaption>
                                )}
                            </figure>
                        )}

                        <div
                            className="prose prose-lg dark:prose-invert prose-slate max-w-none font-sans leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-sm"
                            dangerouslySetInnerHTML={{ __html: post?.content || '' }}
                        />

                        {post?.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
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

                    <aside className="w-full lg:w-[30%]">
                        <div className="sticky top-24 space-y-8">
                            {extractedHeadings?.length > 0 && (
                                <TableOfContents headings={extractedHeadings} activeId={activeId} progress={progress} />
                            )}
                            <div className="bg-sky-50 dark:bg-slate-800 p-6 rounded-2xl border border-sky-100 dark:border-slate-700">
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
                                    <button className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={postUrl}
                title={post?.title || ''}
            />
        </div>
    );
};

export default SinglePostPage;