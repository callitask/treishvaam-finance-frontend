import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { API_URL, getCategories, getTopGainers, getTopLosers, getMostActive } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX } from 'react-icons/fi';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import DevelopmentNotice from '../components/DevelopmentNotice';
import TopMoversCard from '../components/market/TopMoversCard';
import BlogSidebar from '../components/BlogSidebar';
import NewsHighlights from '../components/NewsHighlights';
import DeeperDive from '../components/DeeperDive';

const categoryStyles = { "Stocks": "text-sky-700", "Crypto": "text-sky-700", "Trading": "text-sky-700", "News": "text-sky-700", "Default": "text-sky-700" };

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
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(dateObj);
    return { isNew: diffHours < 48, displayDate };
};

const PostCard = memo(({ article, onCategoryClick }) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew } = formatDateTime(article.updatedAt || article.createdAt);
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(article.updatedAt || article.createdAt));
    const categoryClass = categoryStyles[article.category] || categoryStyles["Default"];
    const isFeatured = article.featured;
    const totalSlides = article.thumbnails?.length || 0;
    const landscapeSlidesToShow = Math.min(totalSlides, 4);
    const landscapeSettings = { dots: false, infinite: totalSlides > landscapeSlidesToShow, speed: 500, slidesToShow: landscapeSlidesToShow, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, arrows: false };

    const CardContent = () => (<div className="p-3 flex flex-col flex-grow"><div className="flex justify-between items-start text-xs mb-2"><div className="flex items-center"><button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{article.category}</button><span className="text-gray-400 mx-2">|</span><span className="text-gray-500 font-medium">By Treishvaam Finance</span></div>{isNew && <span className="font-semibold text-red-500 flex-shrink-0">NEW</span>}</div><h3 className="text-lg font-bold mb-2 text-gray-900 leading-tight break-words"><Link to={`/blog/${article.slug}`} className="hover:underline">{article.title}</Link></h3><p className="text-sm text-gray-700 flex-grow break-words">{createSnippet(article.customSnippet || article.content, 100)}</p><div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><div className="text-xs text-gray-500"><span>{displayDate}</span></div><Link to={`/blog/${article.slug}`} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex-shrink-0 ml-2">Read More</Link></div></div>);
    const ThumbnailDisplay = () => {
        if (!hasThumbnails) return null;
        if (isStory) {
            return (<Slider ref={sliderRef} {...landscapeSettings}>{article.thumbnails.map(thumb => (<div key={thumb.id} className="px-px"><Link to={`/blog/${article.slug}`} className="block bg-gray-100"><ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full object-contain max-h-40" /></Link></div>))}</Slider>);
        }
        const singleThumbnail = article.thumbnails[0];
        return (<Link to={`/blog/${article.slug}`}><ResponsiveAuthImage baseName={singleThumbnail.imageUrl} alt={singleThumbnail.altText || article.title} className="w-full h-auto object-contain max-h-80 bg-gray-100" /></Link>);
    };

    return (<div className="break-inside-avoid bg-white border border-gray-200 mb-px relative flex flex-col">{isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Featured</span></div>)}<ThumbnailDisplay /><CardContent /></div>);
});

const MobilePostCard = memo(({ article, onCategoryClick, layout }) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryClass = categoryStyles[article.category] || categoryStyles["Default"];
    const isFeatured = article.featured;
    const isBannerLayout = layout === 'banner';

    const titleClass = "text-sm font-bold text-gray-900 leading-tight";
    const sliderSettings = { dots: false, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3500, arrows: false };
    
    return (
        <div className={`bg-white shadow-sm flex flex-col relative ${isBannerLayout ? 'col-span-2' : 'col-span-1'}`}>
            {isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-2 py-1 shadow-md uppercase tracking-wider">Featured</span></div>)}
            {hasThumbnails && (
                isStory ? (
                    <Slider ref={sliderRef} {...sliderSettings}>
                        {article.thumbnails.map(thumb => (
                            <div key={thumb.id}>
                                <Link to={`/blog/${article.slug}`}>
                                    <ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full object-cover bg-gray-100 aspect-video" />
                                </Link>
                            </div>
                        ))}
                    </Slider>
                ) : (
                    <Link to={`/blog/${article.slug}`}>
                        <ResponsiveAuthImage baseName={article.thumbnails[0].imageUrl} alt={article.thumbnails[0].altText || article.title} className={`w-full object-cover bg-gray-100 ${isBannerLayout ? 'aspect-video' : 'aspect-square'}`} />
                    </Link>
                )
            )}
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center flex-wrap">
                        <button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{article.category}</button>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-gray-500 font-medium">By Treishvaam Finance</span>
                    </div>
                    {isNew && <span className="font-semibold text-red-500 flex-shrink-0 ml-2">NEW</span>}
                </div>
                <h3 className={titleClass}>
                    <Link to={`/blog/${article.slug}`} className="hover:underline">{article.title}</Link>
                </h3>
                <div className="mt-auto pt-2 text-xs text-gray-500">
                    <span>{displayDate}</span>
                </div>
            </div>
        </div>
    );
});


const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [imageOrientations, setImageOrientations] = useState({});
    const [orientationsLoading, setOrientationsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q') || "";

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/posts`);
                setPosts(response.data);
            } catch (err) { setError('Failed to fetch blog posts.'); } finally { setLoading(false); }
        };
        fetchPosts();

        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                setCategories(response.data);
            } catch (err) { console.error("Failed to fetch categories:", err); } finally { setLoadingCategories(false); }
        };
        fetchCategories();
    }, []);

    const filteredPosts = useMemo(() => {
        let filtered = posts;
        if (selectedCategory !== "All") { filtered = filtered.filter(p => p.category === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); filtered = filtered.filter(p => p.title.toLowerCase().includes(term)); }
        return filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    useEffect(() => {
        if (filteredPosts.length === 0) {
            setOrientationsLoading(false);
            return;
        }
        setOrientationsLoading(true);
        const checkOrientations = async () => {
            const orientations = {};
            const promises = filteredPosts.map(post => {
                if (post.thumbnails && post.thumbnails.length > 0) {
                    return new Promise(resolve => {
                        const img = new Image();
                        img.src = `${API_URL}/api/uploads/${post.thumbnails[0].imageUrl}.webp`;
                        img.onload = () => {
                            orientations[post.thumbnails[0].id] = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait';
                            resolve();
                        };
                        img.onerror = () => {
                            orientations[post.thumbnails[0].id] = 'landscape';
                            resolve();
                        };
                    });
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
            setImageOrientations(orientations);
            setOrientationsLoading(false);
        };
        checkOrientations();
    }, [filteredPosts]);
    
    const mobileLayout = useMemo(() => {
        const layout = [];
        let i = 0;
        while (i < filteredPosts.length) {
            const post1 = filteredPosts[i];
            const isPost1Story = post1.thumbnails && post1.thumbnails.length > 1;
            const post1ThumbnailId = post1.thumbnails?.[0]?.id;
            const isPost1Landscape = post1ThumbnailId ? imageOrientations[post1ThumbnailId] === 'landscape' : true;

            if (isPost1Story && isPost1Landscape) {
                layout.push({ ...post1, layout: 'banner' });
                i++;
            } else {
                layout.push({ ...post1, layout: 'grid' });
                const post2 = filteredPosts[i + 1];
                if (post2) {
                    const isPost2Story = post2.thumbnails && post2.thumbnails.length > 1;
                    const post2ThumbnailId = post2.thumbnails?.[0]?.id;
                    const isPost2Landscape = post2ThumbnailId ? imageOrientations[post2ThumbnailId] === 'landscape' : true;
                    if (!isPost2Story || !isPost2Landscape) {
                        layout.push({ ...post2, layout: 'grid' });
                        i += 2;
                    } else {
                        i++;
                    }
                } else {
                    i++;
                }
            }
        }
        return layout;
    }, [filteredPosts, imageOrientations]);

    const latestPost = useMemo(() => {
        if (!posts || posts.length === 0) return null;
        return posts.reduce((latest, current) => new Date(current.updatedAt || current.createdAt) > new Date(latest.updatedAt || latest.createdAt) ? current : latest);
    }, [posts]);
    
    const pageTitle = latestPost ? `Treishvaam Finance · ${latestPost.title}` : `Treishvaam Finance | Financial News & Analysis`;
    const pageDescription = latestPost ? createSnippet(latestPost.content) : "Your trusted source for financial news and analysis.";
    const imageUrl = latestPost?.thumbnails?.[0]?.imageUrl ? `${API_URL}/api/uploads/${latestPost.thumbnails[0].imageUrl}.webp` : "/logo512.png";
    
    const marketSliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false
    };

    if (loading) return <div className="text-center p-10">Loading posts...</div>;
    if (error) return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50"><div className="text-red-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-semibold text-gray-800 mb-2">Site is Currently Under Maintenance</h2><p className="max-w-md text-gray-600">We are performing essential updates to improve your experience. We apologize for any inconvenience and appreciate your patience. Please check back again shortly.</p></div>);

    return (
        <><DevelopmentNotice /><Helmet><title>{pageTitle}</title><meta name="description" content={pageDescription} /><meta property="og:title" content={pageTitle} /><meta property="og:description" content={pageDescription} /><meta property="og:image" content={imageUrl} /></Helmet>
        <section className="bg-gray-50">
            {/* --- DESKTOP VIEW (sm and up) --- */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2">
                <aside className="lg:col-span-2 order-1 py-6">
                    <div className="space-y-4">
                        <NewsHighlights />
                        <h2 className="font-bold text-xl border-b pb-2 pt-4">Market Movers</h2>
                        <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
                        <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
                        <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
                        <DeeperDive />
                    </div>
                </aside>
                <main className="lg:col-span-8 order-2 min-h-screen py-6 bg-white">
                    <div className="sm:columns-2 md:columns-3 lg:columns-4 gap-px">{filteredPosts.length > 0 ? (filteredPosts.map((article) => (<PostCard key={article.id} article={article} onCategoryClick={setSelectedCategory} />))) : (<div className="text-center p-10 col-span-full"><p>No posts found for your criteria.</p></div>)}</div>
                </main>
                <aside className="lg:col-span-2 order-3 py-6">
                    <div className="space-y-6"><BlogSidebar categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} loadingCategories={loadingCategories} /></div>
                </aside>
            </div>

            {/* --- MOBILE VIEW (screens smaller than sm) --- */}
            <div className="sm:hidden">
                <div className="px-4 py-4">
                    <div className="border-b border-gray-200 mb-4">
                        <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex justify-between items-center py-3 text-lg font-semibold text-gray-800">
                            {showMobileFilters ? 'Hide Filters' : 'Filters & Categories'}
                            {showMobileFilters ? <FiX /> : <FiFilter />}
                        </button>
                        {showMobileFilters && (<div className="py-4"><BlogSidebar categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} loadingCategories={loadingCategories} /></div>)}
                    </div>
                </div>

                <div className="px-4">
                    <NewsHighlights />
                </div>

                {orientationsLoading ? (
                    <div className="text-center p-10">Loading Layout...</div>
                ) : (
                    mobileLayout.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 p-2">
                            {mobileLayout.map((article) => (<MobilePostCard key={article.id} article={article} onCategoryClick={setSelectedCategory} layout={article.layout} />))}
                        </div>
                    ) : (<div className="text-center py-10 px-4"><p>No posts found for your criteria.</p></div>)
                )}
                
                <div className="px-4 pb-4">
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Market Movers</h3>
                        <div className="market-slider-container pb-6 -mx-2">
                            <style>{`.market-slider-container .slick-dots li button:before { font-size: 10px; color: #9ca3af; } .market-slider-container .slick-dots li.slick-active button:before { color: #0284c7; }`}</style>
                            <Slider {...marketSliderSettings}>
                                <div className="px-2">
                                    <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
                                </div>
                                <div className="px-2">
                                    <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
                                </div>
                                <div className="px-2">
                                    <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
                                </div>
                            </Slider>
                        </div>
                    </div>
                </div>
            </div>
        </section></>
    );
};
export default BlogPage;