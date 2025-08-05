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

const SlickArrow = ({ className, style, onClick, isTransparent, children }) => (
    <div
        className={`${className} ${isTransparent ? 'slick-arrow-transparent' : ''}`}
        style={{ ...style, display: 'block' }}
        onClick={onClick}
    >
        {children}
    </div>
);


const PostCard = memo(({ article, onCategoryClick }) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const orientation = article.thumbnailOrientation || 'landscape';
    const isPortraitStory = isStory && orientation === 'portrait';

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
        arrows: totalSlides > landscapeSlidesToShow,
        nextArrow: <SlickArrow isTransparent={true}>&#8250;</SlickArrow>,
        prevArrow: <SlickArrow isTransparent={true}>&#8249;</SlickArrow>,
    };

    const portraitSlidesToShow = Math.min(totalSlides, 3);
    const portraitSettings = {
        dots: false,
        infinite: totalSlides > portraitSlidesToShow,
        speed: 500,
        slidesToShow: portraitSlidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: totalSlides > portraitSlidesToShow,
        vertical: true,
        verticalSwiping: true,
        nextArrow: <SlickArrow isTransparent={true}>▼</SlickArrow>,
        prevArrow: <SlickArrow isTransparent={true}>▲</SlickArrow>,
    };


    const handleWheel = (e) => {
        if (sliderRef.current) {
            e.deltaY > 0 ? sliderRef.current.slickNext() : sliderRef.current.slickPrev();
        }
    };

    const CardContent = () => (
        <div className="p-4 flex flex-col flex-grow">
            <div className="flex justify-between items-start text-xs mb-3">
                {isPortraitStory ? (
                    <div>
                        <button onClick={() => onCategoryClick(article.category)} className={`block font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>
                            {article.category}
                        </button>
                        <span className="block text-gray-500 font-medium mt-1">By Treishvaam Finance</span>
                    </div>
                ) : (
                    <div className="flex items-center">
                        <button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>
                            {article.category}
                        </button>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-gray-500 font-medium">By Treishvaam Finance</span>
                    </div>
                )}
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
                <div className="relative w-full h-full bg-gray-100" onWheel={handleWheel}>
                     <style>{`
                         .slick-arrow-transparent {
                             background: rgba(0,0,0,0.3);
                             border-radius: 50%;
                             color: white !important;
                             z-index: 10;
                             width: 30px;
                             height: 30px;
                             line-height: 30px;
                             text-align: center;
                         }
                         .slick-arrow-transparent:hover { background: rgba(0,0,0,0.6); }
                         .slick-prev { left: 10px; }
                         .slick-next { right: 10px; }
                         .slick-vertical .slick-prev { top: 10px; left: 50%; transform: translateX(-50%); }
                         .slick-vertical .slick-next { bottom: 10px; top: auto; left: 50%; transform: translateX(-50%); }
                         .slick-arrow-transparent::before { content: '' !important; }
                         .slick-slider, .slick-list, .slick-track { height: 100%; }
                         .slick-slide > div {
                             height: 100%;
                         }
                         .slick-vertical .slick-slide {
                            padding: 1px 0;
                         }
                     `}</style>
                    {orientation === 'landscape' ? (
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
                    ) : ( // Portrait
                        <Slider ref={sliderRef} {...portraitSettings}>
                            {article.thumbnails.map(thumb => (
                                <div key={thumb.id} className="bg-gray-100 h-full">
                                     <Link to={`/blog/${article.slug}`} className="block h-full">
                                        <ResponsiveAuthImage
                                            baseName={thumb.imageUrl}
                                            alt={thumb.altText || article.title}
                                            className="w-full h-full object-cover"
                                        />
                                     </Link>
                                </div>
                            ))}
                        </Slider>
                    )}
                </div>
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
        <div className={`break-inside-avoid bg-white border border-gray-200 mb-px relative flex ${isPortraitStory ? 'flex-row h-[520px]' : 'flex-col'}`}>
            {isFeatured && (
                 <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                        Featured
                    </span>
                </div>
            )}

            {hasThumbnails ? (
                isPortraitStory ? (
                    <>
                        <div className="w-1/3 flex-shrink-0 h-full overflow-hidden">
                            <ThumbnailDisplay />
                        </div>
                        <div className="w-2/3 flex">
                            <CardContent />
                        </div>
                    </>
                ) : (
                    <>
                        <ThumbnailDisplay />
                        <CardContent />
                    </>
                )
            ) : (
                <CardContent />
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
            <section className="bg-white py-12">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">Financial <span className="text-sky-600">News & Analysis</span></h1>
                    <p className="text-lg text-gray-700">Stay ahead with timely market developments and expert analysis.</p>
                </div>
            </section>
            <section className="bg-white pt-12 pb-16">
                <div className="container mx-auto px-6">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="w-full max-w-2xl flex items-center gap-2 justify-center mb-4">
                            <input
                                type="text"
                                placeholder="Search financial news..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {allCategories.map(cat => (
                                <button key={cat} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${selectedCategory === cat ? 'bg-sky-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-100'}`} onClick={() => setSelectedCategory(cat)}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-px">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((article) => (
                                <PostCard key={article.id} article={article} onCategoryClick={setSelectedCategory} />
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