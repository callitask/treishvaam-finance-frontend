// src/pages/SinglePostPage.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostByUrlId, API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import ShareButtons from '../components/ShareButtons';
import throttle from 'lodash/throttle';
import TableOfContents from '../components/TableOfContents';
import { AudioPlayer } from '../components/AudioPlayer';
import { ChevronRight, Calendar, User, Tag, Clock } from 'lucide-react';
import { generatePostSchema } from '../utils/schemaGenerator';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const createSnippet = (html, length = 160) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

const calculateReadingTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return `${readingTime} min read`;
};

const SinglePostPage = () => {
    const { urlArticleId } = useParams();

    const preloadedData = (typeof window !== 'undefined' &&
        window.__PRELOADED_STATE__ &&
        window.__PRELOADED_STATE__.urlArticleId === urlArticleId)
        ? window.__PRELOADED_STATE__
        : null;

    const [post, setPost] = useState(preloadedData);
    const [loading, setLoading] = useState(!preloadedData);
    const [error, setError] = useState(null);
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState('');
    const [progress, setProgress] = useState(0);
    const articleRef = useRef(null);

    // --- FIX: Remove Server-Side Schema on Mount ---
    useEffect(() => {
        const serverSchema = document.getElementById('server-schema');
        if (serverSchema) {
            serverSchema.remove();
        }

        if (post) {
            setLoading(false);
            if (window.__PRELOADED_STATE__ && window.__PRELOADED_STATE__.urlArticleId === urlArticleId) {
                delete window.__PRELOADED_STATE__;
            }
            return;
        }

        const fetchPost = async () => {
            try {
                const response = await getPostByUrlId(urlArticleId);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [urlArticleId, post]);

    useEffect(() => {
        if (!post?.content) return;

        // --- PHASE 16 UPDATE: Allow YouTube Iframes ---
        // We configure DOMPurify to allow iframe tags and specific attributes needed for YouTube
        const cleanContent = DOMPurify.sanitize(post.content, {
            USE_PROFILES: { html: true },
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
        });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanContent;

        const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
        const extractedHeadings = Array.from(headingElements).map((el, index) => {
            const id = `heading-${index}-${el.tagName}`;
            el.id = id;
            return { id, text: el.innerText, level: parseInt(el.tagName.substring(1), 10) };
        });

        setHeadings(extractedHeadings);
        // Use the cleaned content (with iframes) for rendering
        setPost(currentPost => ({ ...currentPost, contentWithIds: tempDiv.innerHTML }));
    }, [post?.content]);

    const handleScroll = useMemo(() => throttle(() => {
        const contentElement = articleRef.current;
        if (!contentElement) return;

        const articleTop = contentElement.getBoundingClientRect().top + window.scrollY;
        const contentHeight = contentElement.scrollHeight;
        const viewportHeight = window.innerHeight;

        const scrollableDistance = contentHeight - viewportHeight;
        const scrolledFromTop = window.scrollY - articleTop;

        if (scrolledFromTop > 0 && scrollableDistance > 0) {
            const scrollPercent = (scrolledFromTop / scrollableDistance) * 100;
            setProgress(Math.min(100, Math.max(0, scrollPercent)));
        } else {
            setProgress(0);
        }

        let currentActiveId = '';
        for (let i = headings.length - 1; i >= 0; i--) {
            const element = document.getElementById(headings[i].id);
            if (element && element.getBoundingClientRect().top < 200) {
                currentActiveId = headings[i].id;
                break;
            }
        }
        setActiveId(currentActiveId);
    }, 150), [headings]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            handleScroll.cancel();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-20 text-gray-500">Post not found.</div>;

    const createMarkup = (htmlContent) => ({ __html: htmlContent });

    const categorySlug = post.category?.slug || 'uncategorized';
    const pageUrl = `https://treishfin.treishvaamgroup.com/category/${categorySlug}/${post.userFriendlySlug}/${post.urlArticleId}`;
    const pageTitle = `${post.title} - Treishvaam Finance`;
    const seoDescription = post.metaDescription || post.customSnippet || createSnippet(post.content, 160);
    const categoryName = post.category?.name || "General";

    let imageUrl = `https://treishfin.treishvaamgroup.com/logo.webp`;
    let srcSet = null;

    if (post.coverImageUrl) {
        const base = `${API_URL}/api/uploads/${post.coverImageUrl}`;
        imageUrl = `${base}.webp`;
        srcSet = `
            ${base}-480.webp 480w,
            ${base}-800.webp 800w,
            ${base}-1200.webp 1200w,
            ${base}.webp 1920w
        `;
    }

    let authorName = post.author || "Treishvaam Team";
    if (authorName === "callitask@gmail.com") {
        authorName = "Treishvaam";
    }

    const schemas = generatePostSchema(post, authorName, pageUrl, imageUrl);

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={seoDescription} />
                {post.keywords && <meta name="keywords" content={post.keywords} />}
                <link rel="canonical" href={pageUrl} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:image" content={imageUrl} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={pageUrl} />
                <meta name="twitter:title" content={post.title} />
                <meta name="twitter:description" content={seoDescription} />
                <meta name="twitter:image" content={imageUrl} />
                {schemas && (
                    <script type="application/ld+json">
                        {JSON.stringify(schemas)}
                    </script>
                )}
            </Helmet>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 dark:bg-slate-900 transition-colors duration-300">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                            <Link to="/" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-gray-900 dark:text-white">{categoryName}</span>
                        </nav>

                        <header className="mb-10">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
                                <Tag className="w-3 h-3 mr-1.5" />
                                {categoryName}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 font-serif">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-slate-800 pb-8">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mr-3 text-gray-500 dark:text-gray-300">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-semibold leading-none">{authorName}</p>
                                        <p className="text-xs mt-1">Financial Analyst</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{calculateReadingTime(post.content)}</span>
                                </div>
                            </div>

                            <AudioPlayer title={post.title} content={post.content} />

                        </header>

                        {post.coverImageUrl && (
                            <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800">
                                <img
                                    src={imageUrl}
                                    srcSet={srcSet}
                                    sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
                                    alt={post.coverImageAltText || post.title}
                                    className="w-full h-auto object-cover"
                                    width="1200"
                                    height="675"
                                    fetchPriority="high"
                                />
                            </div>
                        )}

                        <main ref={articleRef}>
                            <article
                                className="prose prose-lg max-w-none 
                                    prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white 
                                    prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-8 
                                    prose-a:text-sky-600 dark:prose-a:text-sky-400 
                                    prose-strong:text-gray-900 dark:prose-strong:text-white
                                    prose-li:text-gray-700 dark:prose-li:text-gray-300
                                    prose-img:rounded-xl
                                    /* Video Aspect Ratio Fix */
                                    [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-xl"
                                dangerouslySetInnerHTML={createMarkup(post.contentWithIds || post.content)}
                            />
                            <div className="mt-16 pt-8 border-t border-gray-200 dark:border-slate-800">
                                <ShareButtons url={pageUrl} title={post.title} />
                            </div>
                            <div className="mt-12 bg-gray-50 dark:bg-slate-800 rounded-xl p-8 flex flex-col sm:flex-row items-start gap-6 border border-gray-100 dark:border-slate-700">
                                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm text-sky-600 dark:text-sky-400 shrink-0 border border-gray-200 dark:border-slate-600">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">About the Author</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        {authorName} is a dedicated financial analyst at Treishvaam Finance. With a passion for simplifying complex market dynamics, they provide actionable insights to empower investors.
                                    </p>
                                    <Link to="/about" className="inline-block mt-3 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                                        Read full bio &rarr;
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>

                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">In this article</h3>
                                </div>
                                <div className="p-4">
                                    <TableOfContents
                                        headings={headings}
                                        activeId={activeId}
                                        progress={progress}
                                    />
                                </div>
                            </div>
                            <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-6 text-center border border-sky-100 dark:border-sky-800/50">
                                <h4 className="font-bold text-sky-900 dark:text-sky-200 mb-2">Stay Updated</h4>
                                <p className="text-sm text-sky-700 dark:text-sky-300 mb-4">Join our community for daily market insights.</p>
                                <Link to="/contact" className="block w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-sm transition-colors">
                                    Get in Touch
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
export default SinglePostPage;