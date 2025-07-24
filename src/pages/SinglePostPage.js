import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import AuthImage from '../components/AuthImage'; // --- FIX: Import the AuthImage component ---

// Helper function to create a snippet from HTML content
const createSnippet = (html, length = 155) => {
    if (!html) return '';
    const sanitizedHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: false } });
    const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
    const plainText = doc.body.textContent || "";
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

// --- FIX: Add the same URL normalization function ---
const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
        return url;
    }
    return `/uploads/${url}`;
};

const SinglePostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await getPost(id);
                setPost(response.data);
            } catch (err) {
                setError('Failed to fetch post.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div className="text-center py-10">Loading post...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-10">Post not found.</div>;

    const createMarkup = (htmlContent) => {
        return { __html: DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } }) };
    };

    const pageUrl = `https://treishfin.treishvaamgroup.com/blog/${post.id}`;
    const metaDescription = createSnippet(post.content);
    // Use the normalized URL for meta tags
    const metaImage = post.coverImageUrl ? `https://backend.treishvaamgroup.com${normalizeImageUrl(post.coverImageUrl)}` : 'https://treishfin.treishvaamgroup.com/logo512.png';

    // Define the Article Schema data
    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": post.title,
        "image": [metaImage],
        "datePublished": post.createdAt,
        "dateModified": post.updatedAt || post.createdAt,
        "author": [{
            "@type": "Organization",
            "name": "Treishvaam Finance",
            "url": "https://treishfin.treishvaamgroup.com/"
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Treishfin",
            "logo": {
                "@type": "ImageObject",
                "url": "https://treishfin.treishvaamgroup.com/logo512.png"
            }
        },
        "description": metaDescription
    };

    return (
        <>
            <Helmet>
                <title>{`${post.title} | Treishfin`}</title>
                <meta name="description" content={metaDescription} />
                <meta name="keywords" content={`${post.category}, ${post.tags ? post.tags.join(', ') : ''}, Treishvaam Finance, treishfin`} />
                
                <meta property="og:title" content={`${post.title} | Treishfin`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:image" content={metaImage} />
                <meta property="og:type" content="article" />
                <meta property="article:published_time" content={post.createdAt} />
                <meta property="article:author" content="Treishvaam Finance" />

                <script type="application/ld+json">
                    {JSON.stringify(articleSchema)}
                </script>
            </Helmet>
            <article className="bg-gray-50">
                <header className="relative h-[400px] bg-gray-200">
                    {/* --- FIX: Use the AuthImage component for the cover image --- */}
                    {post.coverImageUrl && (
                        <AuthImage 
                            src={normalizeImageUrl(post.coverImageUrl)}
                            alt={post.coverImageAltText || post.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                </header>
                <div className="container mx-auto px-4 -mt-32 relative z-10 pb-16">
                    <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl max-w-4xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">{post.title}</h1>
                        <p className="text-gray-500 mb-8">
                            Published on: {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <div 
                            className="prose lg:prose-xl max-w-none"
                            dangerouslySetInnerHTML={createMarkup(post.content)}
                        />
                    </div>
                </div>
            </article>
        </>
    );
}

export default SinglePostPage;