// src/pages/BlogPage.js

import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import DevelopmentNotice from '../components/DevelopmentNotice'; // --- Task 2: Import the new notice component

// --- Helper Functions (No changes needed) ---
const allCategories = ['All', 'Stocks', 'Crypto', 'Trading', 'News'];

const createSnippet = (html, length = 155) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return 'Date not available';
    return dateObj.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

// --- Maintenance Component (For Server Errors) ---
const MaintenanceComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
         <div className="mb-4">
            <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Temporarily Unavailable</h1>
        <p className="text-lg text-gray-600 max-w-xl">
            Our site is currently undergoing scheduled maintenance to improve your experience. We expect to be back online shortly. Thank you for your patience.
        </p>
    </div>
);


// --- PostCard Component ---
const PostCard = memo(({ article }) => {
    const [isPortrait, setIsPortrait] = useState(false);
    const hasThumbnail = !!article.thumbnailUrl;
    const isFeatured = article.featured;

    const handleImageLoad = (event) => {
        const { naturalWidth, naturalHeight } = event.target;
        if (naturalHeight > naturalWidth) {
            setIsPortrait(true);
        }
    };

    const CardContent = ({ showFeaturedTag }) => (
        <div className="flex flex-col flex-grow p-4">
            {showFeaturedTag && (
                <div className="mb-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>Featured</span>
                </div>
            )}
            <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center">
                <span>By Treishvaam Finance</span>
                <span className="mx-2">|</span>
                <span>{formatDateTime(article.updatedAt || article.createdAt)}</span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">
                <Link to={`/blog/${article.id}`} className="hover:text-sky-700 transition-colors">
                    {article.title}
                </Link>
            </h3>
            <p className="text-sm text-gray-700 mb-4 break-words post-preview-content">
                {createSnippet(article.content, 120)}
            </p>
            <Link to={`/blog/${article.id}`} className="font-semibold text-sky-600 hover:text-sky-800 self-start mt-auto">
                Read More
            </Link>
        </div>
    );

    return (
        <div className="break-inside-avoid mb-4 border border-gray-200 relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
            {!hasThumbnail ? (
                <CardContent showFeaturedTag={isFeatured} />
            ) : (
                <div className={`flex ${isPortrait ? 'flex-row' : 'flex-col'}`}>
                    <div className={`flex-shrink-0 ${isPortrait ? 'w-1/2' : 'w-full'} relative`}>
                        <Link to={`/blog/${article.id}`}>
                            <ResponsiveAuthImage
                                baseName={article.thumbnailUrl}
                                alt={article.title}
                                // --- Task 1: Downscale image by setting max height and ensuring object-cover ---
                                className="w-full h-auto max-h-96 object-cover" 
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                onLoad={handleImageLoad}
                            />
                        </Link>
                        {isFeatured && !isPortrait && (
                            <div className="absolute top-2 left-2 z-10">
                                <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider" style={{ letterSpacing: '0.08em' }}>Featured</span>
                            </div>
                        )}
                    </div>
                    <div className={`${isPortrait ? 'w-1/2' : 'w-full'}`}>
                        <CardContent showFeaturedTag={isFeatured && isPortrait} />
                    </div>
                </div>
            )}
        </div>
    );
});

// --- BlogPage Component ---
const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts`);
                setPosts(response.data);
            } catch (err) {
                // Task 3: Set a generic error to trigger the maintenance message
                setError('Failed to fetch blog posts.'); 
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        let filtered = posts;
        if (selectedCategory !== "All") {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
        }
        return filtered;
    }, [posts, selectedCategory, searchTerm]);

    const latestPost = useMemo(() => posts.length > 0 ? posts[0] : null, [posts]);

    const pageTitle = latestPost ? `Treishvaam Finance · ${latestPost.title}` : `Treishvaam Finance | Financial News & Analysis`;
    const pageDescription = latestPost ? createSnippet(latestPost.content) : "Your trusted source for financial news and analysis.";
    const imageUrl = latestPost?.thumbnailUrl
        ? `${API_URL}/api/uploads/${latestPost.thumbnailUrl}.webp`
        : "/logo512.png";

    if (loading) return <div className="text-center p-10">Loading posts...</div>;
    // --- Task 3: Show the professional maintenance component on error ---
    if (error) return <MaintenanceComponent />; 

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
            </Helmet>

            {/* --- Task 2: Render the one-time development notice --- */}
            <DevelopmentNotice />

            <section className="bg-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Financial <span className="text-sky-600">News & Analysis</span></h1>
                    <p className="text-lg text-gray-700">Stay ahead with timely market developments and expert analysis.</p>
                </div>
            </section>

            <section className="bg-white pt-0 pb-12">
                <div className="container mx-auto px-6">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="w-full max-w-3xl flex items-center gap-2 justify-center mb-4">
                            <input
                                type="text"
                                placeholder="Search financial news..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="search-input py-2.5 pl-4 pr-4 border border-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm shadow-sm"
                            />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {allCategories.map(cat => (
                                <button key={cat} className={`filter-button px-3 py-1.5 text-sm transition-colors duration-200 border ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'}`} onClick={() => setSelectedCategory(cat)}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((article) => (
                                <PostCard key={article.id} article={article} />
                            ))
                        ) : (
                            <p className="text-center p-10 col-span-full">No posts found.</p>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogPage;