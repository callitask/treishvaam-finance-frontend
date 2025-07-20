import React, { useState, useEffect, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Helmet } from 'react-helmet-async';

const allCategories = ['All', 'Stocks', 'Crypto', 'Trading', 'News'];

const createSnippet = (html, length = 100) => {
    if (!html) return '';
    const sanitizedHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    const doc = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
    const plainText = doc.body.textContent || "";
    return plainText.substring(0, length) + (plainText.length > length ? '...' : '');
};

const formatDateTime = (dateString) => {
    if (!dateString) return 'Date not available';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return 'Date not available';
    return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const PostCard = memo(({ article }) => {
    const [isPortrait, setIsPortrait] = useState(false);
    const hasThumbnail = !!article.thumbnailUrl;
    const isFeatured = article.featured;
    const fullThumbnailUrl = article.thumbnailUrl ? `${API_URL}${article.thumbnailUrl}` : null;

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
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider" style={{letterSpacing: '0.08em'}}>Featured</span>
                </div>
            )}
            <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center">
                <span>By Treishvaam Finance</span>
                <span className="mx-2">|</span>
                <span>{formatDateTime(article.createdAt)}</span>
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
        <div className="break-inside-avoid mb-4 border border-gray-200 relative">
            {!hasThumbnail ? (
                <CardContent showFeaturedTag={isFeatured} />
            ) : (
                <div className={`flex ${isPortrait ? 'flex-row' : 'flex-col'}`}>
                    <div className={`flex-shrink-0 ${isPortrait ? 'w-1/2' : 'w-full'} relative`}>
                        <Link to={`/blog/${article.id}`}>
                            {fullThumbnailUrl && (
                                <LazyLoadImage
                                    alt={article.title}
                                    effect="blur"
                                    src={fullThumbnailUrl}
                                    className="w-full h-auto rounded-t-lg object-contain"
                                    onLoad={handleImageLoad}
                                />
                            )}
                        </Link>
                        {isFeatured && (
                            <div className="absolute top-2 left-2 z-10">
                                <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider" style={{letterSpacing: '0.08em'}}>Featured</span>
                            </div>
                        )}
                    </div>
                    <div className={`${isPortrait ? 'w-1/2' : 'w-full'}`}>
                        <CardContent />
                    </div>
                </div>
            )}
        </div>
    );
});

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
                const sortedPosts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPosts(sortedPosts);
            } catch (err) {
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
            filtered = filtered.filter(p => p.title.toLowerCase().includes(term) || (p.content && p.content.toLowerCase().includes(term)));
        }
        return filtered;
    }, [posts, selectedCategory, searchTerm]);

    if (loading) return <div className="text-center p-10">Loading posts...</div>;
    if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

    return (
        <>
            <Helmet>
                <title>Financial News & Analysis Blog | Treishfin</title>
                <meta name="description" content="Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance. Your source for insights on stocks, crypto, and trading." />
                <meta name="keywords" content="financial news, latest news, market updates, stock analysis, crypto news, trading insights, Treishvaam, Treishvaam Finance" />
                <meta property="og:title" content="Financial News & Analysis Blog | Treishfin" />
                <meta property="og:description" content="Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance." />
                <meta property="og:url" content="https://treishfin.treishvaamgroup.com/blog" />
                <meta property="og:image" content="https://treishfin.treishvaamgroup.com/logo512.png" />
                <meta property="og:type" content="website" />
            </Helmet>

            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            <span>Financial </span>
                            <span className="text-sky-600">News & Analysis</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700">Stay ahead with timely market developments, expert analysis, and strategic insights for your trading journey.</p>
                    </div>
                </div>
            </section>

            <section className="bg-white pt-0 pb-12">
                <div className="container mx-auto px-6">
                    <div className="mb-10 flex flex-col items-center">
                        <form className="w-full max-w-3xl flex items-center gap-2 justify-center mb-4" onSubmit={e => e.preventDefault()}>
                            <div className="relative flex-grow">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search financial news..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="search-input py-2.5 pl-10 pr-4 border border-gray-400 text-black w-full focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-500 text-sm rounded-none shadow-sm"
                                />
                            </div>
                            <button type="submit" className="px-6 py-2.5 bg-sky-500 text-white font-semibold hover:bg-sky-600 transition rounded-none text-sm">Search</button>
                        </form>
                        <div className="flex flex-wrap justify-center gap-2">
                            {allCategories.map(cat => (
                                <button key={cat} className={`filter-button px-3 py-1.5 text-sm rounded-none transition-colors duration-200 border ${selectedCategory === cat ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-400 hover:bg-gray-100'}`} onClick={() => setSelectedCategory(cat)}>
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
                            <p className="text-center p-10">No posts found.</p>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default BlogPage;