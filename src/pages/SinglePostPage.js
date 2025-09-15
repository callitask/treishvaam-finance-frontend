import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug, API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import 'suneditor/dist/css/suneditor.min.css';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ShareButtons from '../components/ShareButtons';
import { FaUserCircle } from 'react-icons/fa';

const createSnippet = (html, length = 160) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const SinglePostPage = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPostBySlug(slug);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return <div className="text-center py-20">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    const createMarkup = (htmlContent) => ({
        __html: DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } })
    });

    const pageTitle = `Treishvaam Finance · ${post.title}`;
    const pageDescription = createSnippet(post.customSnippet || post.content);
    const pageUrl = `https://treishfin.treishvaamgroup.com/blog/${post.slug}`;
    const imageUrl = post.coverImageUrl
        ? `${API_URL}/api/uploads/${post.coverImageUrl}.webp`
        : `${window.location.origin}/logo512.png`;

    // --- Refined Article Schema for Structured Data ---
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageUrl
      },
      "headline": post.title,
      "description": pageDescription,
      "image": imageUrl,
      "author": {
        "@type": "Person",
        "name": post.author || "Treishvaam Finance Team" // Fallback author name
      },
      "publisher": {
        "@type": "Organization",
        "name": "Treishvaam Finance",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo512.png`
        }
      },
      // Ensure dates are in ISO 8601 format
      "datePublished": post.createdAt ? new Date(post.createdAt).toISOString() : '',
      "dateModified": post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date(post.createdAt).toISOString()
    };

    return (
        <>
            <Helmet>
                {/* Standard Meta Tags */}
                <title>{pageTitle}</title>
                <link rel="canonical" href={pageUrl} />
                <meta name="description" content={pageDescription} />

                {/* Open Graph (OG) Tags for Social Media */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="article" />

                {/* Dynamically Injecting the JSON-LD Article Schema */}
                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
            </Helmet>

            <article className="bg-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Post Header */}
                    <header className="mb-8">
                        <div className="mb-4">
                            {post.category && (
                                <Link to={`/category/${post.category.slug}`} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm uppercase tracking-wide">
                                    {post.category.name}
                                </Link>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                            {post.title}
                        </h1>
                        <div className="flex items-center text-gray-500 text-sm">
                            <div className="flex items-center">
                                <FaUserCircle className="mr-2" />
                                <span>{post.author || 'Admin'}</span>
                            </div>
                            <span className="mx-2">·</span>
                            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                            {post.updatedAt && post.updatedAt !== post.createdAt && (
                                <>
                                    <span className="mx-2">·</span>
                                    <i>Updated on {formatDate(post.updatedAt)}</i>
                                </>
                            )}
                        </div>
                    </header>

                    {/* Cover Image */}
                    {post.coverImageUrl && (
                        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                           <ResponsiveAuthImage
                                imageName={post.coverImageUrl}
                                alt={post.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    {/* Post Content */}
                    <div
                        className="prose prose-lg max-w-none sun-editor-editable"
                        dangerouslySetInnerHTML={createMarkup(post.content)}
                    />

                    {/* Share Buttons */}
                    <div className="mt-12 pt-8 border-t">
                        <p className="text-center font-semibold text-gray-700 mb-4">Share this article</p>
                        <ShareButtons url={pageUrl} title={post.title} />
                    </div>
                </div>
            </article>
        </>
    );
}

export default SinglePostPage;