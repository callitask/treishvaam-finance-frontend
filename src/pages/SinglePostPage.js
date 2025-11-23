import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostByUrlId, API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ShareButtons from '../components/ShareButtons';
import throttle from 'lodash/throttle';
import TableOfContents from '../components/TableOfContents';
import { ChevronRight, Calendar, User, Tag, Clock } from 'lucide-react';

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

// Estimate reading time based on word count
const calculateReadingTime = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return `${readingTime} min read`;
};

const SinglePostPage = () => {
    const { urlArticleId } = useParams();

    // --- STATE HYDRATION LOGIC ---
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

    useEffect(() => {
        // --- CRITICAL FIX: Prevent Duplicate Schema ---
        const staticSchema = document.getElementById('schema-json-ld');
        if (staticSchema) {
            staticSchema.remove();
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlArticleId]);

    useEffect(() => {
        if (!post?.content) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true }, ADD_ATTR: ['id'] });

        const headingElements = tempDiv.querySelectorAll('h2, h3, h4');
        const extractedHeadings = Array.from(headingElements).map((el, index) => {
            const id = `heading-${index}-${el.tagName}`;
            el.id = id;
            return { id, text: el.innerText, level: parseInt(el.tagName.substring(1), 10) };
        });

        setHeadings(extractedHeadings);
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

    if (loading) return <div className="text-center py-20">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    const createMarkup = (htmlContent) => ({ __html: htmlContent });

    // --- URL & Metadata ---
    const categorySlug = post.category?.slug || 'uncategorized';
    const pageUrl = `https://treishfin.treishvaamgroup.com/category/${categorySlug}/${post.userFriendlySlug}/${post.urlArticleId}`;
    const pageTitle = `${post.title} - Treishvaam Finance`;
    const seoDescription = post.metaDescription || post.customSnippet || createSnippet(post.content, 160);
    const imageUrl = post.coverImageUrl ? `${API_URL}/api/uploads/${post.coverImageUrl}.webp` : `https://treishfin.treishvaamgroup.com/logo.webp`;
    const authorName = post.author || "Treishvaam Team";
    const categoryName = post.category?.name || "General";

    // --- JSON-LD Schemas ---

    // 1. BreadcrumbList Schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://treishfin.treishvaamgroup.com/"
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": categoryName,
            "item": `https://treishfin.treishvaamgroup.com/category/${categorySlug}` // Assumes category page exists or points to filter
        }, {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": pageUrl
        }]
    };

    // 2. Article Schema
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": pageUrl
        },
        "headline": post.title,
        "image": [imageUrl],
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": {
            "@type": "Person",
            "name": authorName,
            "url": "https://treishfin.treishvaamgroup.com/about"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "logo": {
                "@type": "ImageObject",
                "url": "https://treishfin.treishvaamgroup.com/logo.webp"
            }
        },
        "description": seoDescription
    };

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

                {/* Inject Multiple Schemas */}
                <script type="application/ld+json">
                    {JSON.stringify([breadcrumbSchema, articleSchema])}
                </script>
            </Helmet>

            {/* --- Main Container --- */}
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">

                    {/* --- Left Column: Content (Width: 8/12 or 9/12) --- */}
                    <div className="lg:col-span-8 xl:col-span-9">

                        {/* Breadcrumbs */}
                        <nav className="flex items-center text-sm text-gray-500 mb-6 font-medium">
                            <Link to="/" className="hover:text-sky-600 transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4 mx-2" />
                            <span className="text-gray-900">{categoryName}</span>
                        </nav>

                        {/* Article Header */}
                        <header className="mb-10">
                            {/* Category Pill */}
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider mb-4">
                                <Tag className="w-3 h-3 mr-1.5" />
                                {categoryName}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 font-serif">
                                {post.title}
                            </h1>

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-sm text-gray-500 border-b border-gray-100 pb-8">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-semibold leading-none">{authorName}</p>
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
                        </header>

                        {/* Cover Image */}
                        {post.coverImageUrl && (
                            <div className="mb-10 rounded-xl overflow-hidden shadow-lg">
                                <ResponsiveAuthImage
                                    baseName={post.coverImageUrl}
                                    alt={post.coverImageAltText || post.title}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* Main Article Content */}
                        <main ref={articleRef}>
                            <article
                                className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-8 prose-a:text-sky-600 prose-img:rounded-xl"
                                dangerouslySetInnerHTML={createMarkup(post.contentWithIds || post.content)}
                            />

                            {/* Share Section */}
                            <div className="mt-16 pt-8 border-t border-gray-200">
                                <ShareButtons url={pageUrl} title={post.title} />
                            </div>

                            {/* Author Bio Card */}
                            <div className="mt-12 bg-gray-50 rounded-xl p-8 flex flex-col sm:flex-row items-start gap-6 border border-gray-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-sky-600 shrink-0 border border-gray-200">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">About the Author</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {authorName} is a dedicated financial analyst at Treishvaam Finance. With a passion for simplifying complex market dynamics, they provide actionable insights to empower investors.
                                    </p>
                                    <Link to="/about" className="inline-block mt-3 text-sm font-semibold text-sky-600 hover:underline">
                                        Read full bio &rarr;
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>

                    {/* --- Right Column: Sidebar (Width: 4/12 or 3/12) --- */}
                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
                        <div className="sticky top-24 space-y-8">

                            {/* Table of Contents */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">In this article</h3>
                                </div>
                                <div className="p-4">
                                    <TableOfContents
                                        headings={headings}
                                        activeId={activeId}
                                        progress={progress}
                                    />
                                </div>
                            </div>

                            {/* Ad / CTA Placeholder */}
                            <div className="bg-sky-50 rounded-xl p-6 text-center border border-sky-100">
                                <h4 className="font-bold text-sky-900 mb-2">Stay Updated</h4>
                                <p className="text-sm text-sky-700 mb-4">Join our community for daily market insights.</p>
                                <Link to="/contact" className="block w-full py-2 px-4 bg-sky-600 text-white rounded-lg font-semibold text-sm hover:bg-sky-700 transition-colors">
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