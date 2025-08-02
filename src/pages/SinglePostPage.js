import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- CORRECTED IMPORT: Use getPostBySlug ---
import { getPostBySlug, API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import 'suneditor/dist/css/suneditor.min.css';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ShareButtons from '../components/ShareButtons';
import { FaUserCircle } from 'react-icons/fa';

const createSnippet = (html, length = 155) => {
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
    // --- CORRECTED: Get slug from URL params ---
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // --- CORRECTED: Fetch post using the slug ---
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
    }, [slug]); // --- CORRECTED: Dependency is now slug ---

    if (loading) return <div className="text-center py-20">Loading post...</div>;
    if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
    if (!post) return <div className="text-center py-20">Post not found.</div>;

    const createMarkup = (htmlContent) => ({
        __html: DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } })
    });

    const pageTitle = `Treishvaam Finance · ${post.title}`;
    const pageDescription = createSnippet(post.content);
    // --- CORRECTED: Use slug for the canonical URL ---
    const pageUrl = `https://treishfin.treishvaamgroup.com/blog/${post.slug}`;
    const imageUrl = post.coverImageUrl
        ? `${API_URL}/api/uploads/${post.coverImageUrl}.webp`
        : `${window.location.origin}/logo512.png`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="article" />
            </Helmet>

            <article className="bg-white">
                <header className="relative h-[60vh] min-h-[400px] text-white">
                    <ResponsiveAuthImage
                        baseName={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 md:p-12">
                        <Link to={`/blog?category=${post.category}`} className="bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-sky-600 transition">
                            {post.category}
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-extrabold mt-4 leading-tight shadow-text">{post.title}</h1>
                        <div className="flex items-center mt-4 text-sm">
                            <FaUserCircle className="mr-2" />
                            <span>By {post.author}</span>
                            <span className="mx-2">|</span>
                            <span>Published on {formatDate(post.updatedAt || post.createdAt)}</span>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-12">
                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
                        <div
                            className="w-full lg:w-2/3 sun-editor-editable max-w-none"
                            dangerouslySetInnerHTML={createMarkup(post.content)}
                        />
                        <aside className="w-full lg:w-1/3 lg:sticky top-28 self-start">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <h3 className="text-lg font-bold mb-4 border-b pb-2">Share this Article</h3>
                                <ShareButtons url={pageUrl} title={post.title} summary={pageDescription} />
                                {post.tags && post.tags.length > 0 && (
                                    <>
                                        <h3 className="text-lg font-bold mt-8 mb-4 border-b pb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.map(tag => (
                                                <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </article>
        </>
    );
}

export default SinglePostPage;