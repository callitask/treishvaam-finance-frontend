import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { API_URL } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import DevelopmentNotice from '../components/DevelopmentNotice';
import MarketMap from '../components/MarketMap';

const allCategories = ['All', 'Stocks', 'Crypto', 'Trading', 'News'];

const categoryStyles = {
    "Stocks": "text-sky-700",
    "Crypto": "text-sky-700",
    "Trading": "text-sky-700",
    "News": "text-sky-700",
    "Default": "text-sky-700"
};

const createSnippet = (html, length = 155) => {
    if (!html) return '';
    const plainText = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    if (plainText.length <= length) return plainText;
    const trimmed = plainText.substring(0, length);
    return trimmed.substring(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
};

const formatDateTime = (dateString) => {
    if (!dateString) return { isNew: false, displayDate: 'Date not available' };
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return { isNew: false, displayDate: 'Date not available' };
    
    const now = new Date();
    const diffHours = (now - dateObj) / (1000 * 60 * 60);

    const displayDate = new Intl.DateTimeFormat('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    }).format(dateObj);

    return { isNew: diffHours < 48, displayDate };
};

const PostCard = memo(({ article, onCategoryClick }) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;

    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryClass = categoryStyles[article.category] || categoryStyles["Default"];
    const isFeatured = article.featured;

    const totalSlides = article.thumbnails?.length || 0;
    
    const landscapeSlidesToShow = Math.min(totalSlides, 4);
    const landscapeSettings = {
        dots: false,
        infinite: totalSlides > landscapeSlidesToShow,
        speed: 500,
        slidesToShow: landscapeSlidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
    };

    const CardContent = () => (
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start text-xs mb-3">
                <div className="flex items-center">
                    <button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>
                        {article.category}
                    </button>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-500 font-medium">By Treishvaam Finance</span>
                </div>
                {isNew && <span className="font-semibold text-red-500 flex-shrink-0">NEW</span>}
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-gray-900 leading-tight break-words">
                <Link to={`/blog/${article.slug}`} className="hover:underline">
                    {article.title}
                </Link>
            </h3>

            <p className="text-sm text-gray-700 flex-grow break-words">
                {createSnippet(article.customSnippet || article.content, 120)}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    <span>{displayDate}</span>
                </div>
                <Link to={`/blog/${article.slug}`} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex-shrink-0 ml-2">
                    Read More
                </Link>
            </div>
        </div>
    );

    const ThumbnailDisplay = () => {
        if (!hasThumbnails) return null;

        if (isStory) {
            return (
                <Slider ref={sliderRef} {...landscapeSettings}>
                    {article.thumbnails.map(thumb => (
                        <div key={thumb.id} className="px-px">
                            <Link to={`/blog/${article.slug}`} className="block bg-gray-100">
                                <ResponsiveAuthImage
                                    baseName={thumb.imageUrl}
                                    alt={thumb.altText || article.title}
                                    className="w-full object-contain max-h-40"
                                />
                            </Link>
                        </div>
                    ))}
                </Slider>
            );
        }

        const singleThumbnail = article.thumbnails[0];
        return (
             <Link to={`/blog/${article.slug}`}>
                <ResponsiveAuthImage
                    baseName={singleThumbnail.imageUrl}
                    alt={singleThumbnail.altText || article.title}
                    className="w-full h-auto object-contain max-h-80 bg-gray-100"
                />
            </Link>
        );
    };

    return (
        <div className="break-inside-avoid bg-white border border-gray-200 mb-px relative flex flex-col">
            {isFeatured && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                        Featured
                    </span>
                </div>
            )}
            <ThumbnailDisplay />
            <CardContent />
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
                setPosts(response.data);
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
            filtered = filtered.filter(p => p.title.toLowerCase().includes(term));
        }
        return filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    const latestPost = useMemo(() => {
        if (!posts || posts.length === 0) return null;
        return posts.reduce((latest, current) => {
            const latestDate = new Date(latest.updatedAt || latest.createdAt);
            const currentDate = new Date(current.updatedAt || current.createdAt);
            return currentDate > latestDate ? current : latest;
        });
    }, [posts]);
    
    const pageTitle = latestPost ? `Treishvaam Finance · ${latestPost.title}` : `Treishvaam Finance | Financial News & Analysis`;
    const pageDescription = latestPost ? createSnippet(latestPost.content) : "Your trusted source for financial news and analysis.";
    const imageUrl = latestPost?.thumbnails?.[0]?.imageUrl ? `${API_URL}/api/files/${latestPost.thumbnails[0].imageUrl}.webp` : "/logo512.png";

    if (loading) return <div className="text-center p-10">Loading posts...</div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50">
            <div className="text-red-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Site is Currently Under Maintenance</h2>
            <p className="max-w-md text-gray-600">
                We are performing essential updates to improve your experience. We apologize for any inconvenience and appreciate your patience. Please check back again shortly.
            </p>
        </div>
    );

    return (
        <>
            <DevelopmentNotice />
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
            </Helmet>
            
            <section className="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-12">

                    {/* --- Left Sidebar --- */}
                    <aside className="lg:col-span-2 xl:col-span-2 order-3 lg:order-1 bg-gray-50 lg:sticky lg:h-screen lg:overflow-y-auto top-0 p-6">
                        <h3 className="font-bold text-lg mb-4 border-b pb-2">Market Map</h3>
                        <MarketMap />
                    </aside>

                    {/* --- Main Content --- */}
                    <main className="lg:col-span-8 xl:col-span-8 order-2 lg:order-2 min-h-screen p-6">
                        <div className="sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-px">
                            {filteredPosts.length > 0 ? (
                                filteredPosts.map((article) => (
                                    <PostCard key={article.id} article={article} onCategoryClick={setSelectedCategory} />
                                ))
                            ) : (
                                <div className="text-center p-10 col-span-full">
                                    <p>No posts found for your criteria.</p>
                                </div>
                            )}
                        </div>
                    </main>

                    {/* --- Right Sidebar --- */}
                    <aside className="lg:col-span-2 xl:col-span-2 order-1 lg:order-3 bg-white lg:sticky lg:h-screen lg:overflow-y-auto top-0 p-6">
                         <h1 className="text-3xl font-bold mb-2 text-gray-900">
                            Finance <span className="text-sky-600">World</span>
                        </h1>
                        <p className="text-sm text-gray-500 mb-6">Stay ahead with timely market developments.</p>
                        
                        <div className="flex flex-col gap-y-6">
                            <div>
                                <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search Articles</label>
                                <input
                                    id="search-input"
                                    type="text"
                                    placeholder="e.g., 'Inflation'..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <h3 className="block text-sm font-medium text-gray-700 mb-2">Categories</h3>
                                <div className="flex flex-col items-stretch gap-2">
                                    {allCategories.map(cat => (
                                        <button 
                                            key={cat} 
                                            className={`w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${selectedCategory === cat ? 'bg-sky-600 text-white shadow' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`} 
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </section>
        </>
    );
};

export default BlogPage;