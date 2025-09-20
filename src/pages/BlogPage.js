import React, { useState, useEffect, useMemo, memo, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL, getCategories, getPaginatedPosts, getTopGainers, getTopLosers, getMostActive } from '../apiConfig';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX } from 'react-icons/fi';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import DevelopmentNotice from '../components/DevelopmentNotice';
import TopMoversCard from '../components/market/TopMoversCard';
import BlogSidebar from '../components/BlogSidebar';
import NewsHighlights from '../components/NewsHighlights';
import DeeperDive from '../components/DeeperDive';
import IndexCharts from '../components/market/IndexCharts';
import MarketMovers from '../components/market/MarketMovers'; // Import the new component
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SearchAutocomplete from '../components/SearchAutocomplete';


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

const PostCard = memo(forwardRef(({ article, onCategoryClick }, ref) => {
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
    const CardContent = () => (<div className="p-3 flex flex-col flex-grow"><div className="flex justify-between items-start text-xs mb-2"><div className="flex items-center"><button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{article.category}</button><span className="text-gray-400 mx-2">|</span><span className="text-gray-500 font-medium">By Treishvaam Finance</span></div>{isNew && <span className="font-semibold text-red-500 flex-shrink-0">NEW</span>}</div><h3 className="text-lg font-bold mb-2 text-gray-900 leading-tight break-words"><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="hover:underline">{article.title}</Link></h3><p className="text-sm text-gray-700 flex-grow break-words">{createSnippet(article.customSnippet || article.content, 100)}</p><div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><div className="text-xs text-gray-500"><span>{displayDate}</span></div><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex-shrink-0 ml-2">Read More</Link></div></div>);
    const ThumbnailDisplay = () => { if (!hasThumbnails) return null; if (isStory) { return (<Slider ref={sliderRef} {...landscapeSettings}>{article.thumbnails.map(thumb => (<div key={thumb.id} className="px-px"><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="block bg-gray-100"><ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full object-contain max-h-40" /></Link></div>))}</Slider>); } const singleThumbnail = article.thumbnails[0]; return (<Link to={`/blog/${article.userFriendlySlug}/${article.id}`}><ResponsiveAuthImage baseName={singleThumbnail.imageUrl} alt={singleThumbnail.altText || article.title} className="w-full h-auto object-contain max-h-80 bg-gray-100" /></Link>); };
    return (<div ref={ref} className="break-inside-avoid bg-white border border-gray-200 mb-px relative flex flex-col">{isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Featured</span></div>)}<ThumbnailDisplay /><CardContent /></div>);
}));

const GridPostCard = memo(forwardRef(({ article, onCategoryClick }, ref) => {
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
    const CardContent = () => (<div className="p-3 flex flex-col flex-grow"><div className="flex justify-between items-start text-xs mb-2"><div className="flex items-center"><button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{article.category}</button><span className="text-gray-400 mx-2">|</span><span className="text-gray-500 font-medium">By Treishvaam Finance</span></div>{isNew && <span className="font-semibold text-red-500 flex-shrink-0">NEW</span>}</div><h3 className="text-lg font-bold mb-2 text-gray-900 leading-tight break-words"><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="hover:underline">{article.title}</Link></h3><p className="text-sm text-gray-700 flex-grow break-words">{createSnippet(article.customSnippet || article.content, 100)}</p><div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><div className="text-xs text-gray-500"><span>{displayDate}</span></div><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex-shrink-0 ml-2">Read More</Link></div></div>);
    const ThumbnailDisplay = () => { if (!hasThumbnails) return null; if (isStory) { return (<Slider ref={sliderRef} {...landscapeSettings}>{article.thumbnails.map(thumb => (<div key={thumb.id} className="px-px"><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="block bg-gray-100"><ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full object-contain max-h-40" /></Link></div>))}</Slider>); } const singleThumbnail = article.thumbnails[0]; return (<Link to={`/blog/${article.userFriendlySlug}/${article.id}`}><ResponsiveAuthImage baseName={singleThumbnail.imageUrl} alt={singleThumbnail.altText || article.title} className="w-full h-auto object-contain max-h-80 bg-gray-100" /></Link>); };
    return (<div ref={ref} className="bg-white border border-gray-200 relative flex flex-col h-full">{isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Featured</span></div>)}<ThumbnailDisplay /><CardContent /></div>);
}));

const BannerPostCard = memo(forwardRef(({ article, onCategoryClick }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const bannerSliderSettings = { dots: false, fade: true, infinite: true, speed: 1000, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000, arrows: false, pauseOnHover: false };
    const ThumbnailDisplay = () => { if (!hasThumbnails) return null; if (isStory) { return (<Slider ref={sliderRef} {...bannerSliderSettings}>{article.thumbnails.map(thumb => (<div key={thumb.id}><ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full h-full object-cover" /></div>))}</Slider>); } return (<ResponsiveAuthImage baseName={article.thumbnails[0].imageUrl} alt={article.thumbnails[0].altText || article.title} className="w-full h-full object-cover" />); };
    return (<div ref={ref} className="block relative bg-black text-white overflow-hidden border border-gray-200 group"><div className="absolute inset-0"><ThumbnailDisplay /></div><div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent group-hover:via-black/80 transition-all duration-300"></div><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="relative p-8 flex flex-col justify-end min-h-[400px] z-10"><div className="flex justify-between items-center text-sm mb-2"><div className="flex items-center gap-3"><span onClick={(e) => { e.preventDefault(); onCategoryClick(article.category); }} className="font-bold uppercase tracking-wider text-sky-300 hover:underline cursor-pointer">{article.category}</span><span className="text-gray-400">|</span><span className="text-gray-300">{displayDate}</span></div>{isNew && <span className="font-semibold text-red-500 bg-white/20 px-2 py-1 rounded-full text-xs">NEW</span>}</div><h2 className="text-3xl md:text-4xl font-bold my-2 leading-tight text-white group-hover:text-sky-200 transition-colors duration-300">{article.title}</h2><p className="text-gray-200 text-base mt-2 max-w-2xl hidden md:block">{createSnippet(article.customSnippet || article.content, 150)}</p><div className="text-xs text-gray-400 mt-4">By Treishvaam Finance</div></Link></div>);
}));

const MobilePostCard = memo(forwardRef(({ article, onCategoryClick, layout }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryClass = categoryStyles[article.category] || categoryStyles["Default"];
    const isFeatured = article.featured;
    const isBannerLayout = layout === 'banner';
    const titleClass = "text-sm font-bold text-gray-900 leading-tight";
    const sliderSettings = { dots: false, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3500, arrows: false };
    return (<div ref={ref} className={`bg-white shadow-sm flex flex-col relative ${isBannerLayout ? 'col-span-2' : 'col-span-1'}`}>{isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-2 py-1 shadow-md uppercase tracking-wider">Featured</span></div>)}{hasThumbnails && (isStory ? (<Slider ref={sliderRef} {...sliderSettings}>{article.thumbnails.map(thumb => (<div key={thumb.id}><Link to={`/blog/${article.userFriendlySlug}/${article.id}`}><ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full object-cover bg-gray-100 aspect-video" /></Link></div>))}</Slider>) : (<Link to={`/blog/${article.userFriendlySlug}/${article.id}`}><ResponsiveAuthImage baseName={article.thumbnails[0].imageUrl} alt={article.thumbnails[0].altText || article.title} className={`w-full object-cover bg-gray-100 ${isBannerLayout ? 'aspect-video' : 'aspect-square'}`} /></Link>))}<div className="p-3 flex flex-col flex-grow"><div className="flex items-center justify-between text-xs mb-2"><div className="flex items-center flex-wrap"><button onClick={() => onCategoryClick(article.category)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{article.category}</button><span className="text-gray-400 mx-2">|</span><span className="text-gray-500 font-medium">By Treishvaam Finance</span></div>{isNew && <span className="font-semibold text-red-500 flex-shrink-0 ml-2">NEW</span>}</div><h3 className={titleClass}><Link to={`/blog/${article.userFriendlySlug}/${article.id}`} className="hover:underline">{article.title}</Link></h3><div className="mt-auto pt-2 text-xs text-gray-500"><span>{displayDate}</span></div></div></div>);
}));


// Component for the category filter dropdown, to be used in the portal
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    if (loadingCategories) {
        return <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>;
    }

    return (
        <div className="relative">
            <button
                type="button"
                className="w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200 hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedCategory}
                <svg className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isDropdownOpen && (
                <div className="absolute z-20 mt-2 w-full origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-100 ease-in-out">
                    <div className="py-1">
                        {allCategories.map(cat => (
                            <div
                                key={cat}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setIsDropdownOpen(false);
                                }}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// The Portal component that will render the blog-specific navbar items
const NavbarExtrasPortal = ({ children }) => {
    const [mountNode, setMountNode] = useState(null);

    useEffect(() => {
        const node = document.getElementById('navbar-extras-portal-target');
        setMountNode(node);
        // Cleanup function to clear the portal content when the component unmounts
        return () => {
            if (node) {
                node.innerHTML = '';
            }
        };
    }, []);

    return mountNode ? createPortal(children, mountNode) : null;
};


const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
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

    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [selectedCategory, searchTerm]);

    useEffect(() => {
        setLoading(true);
        setError('');
        getPaginatedPosts(page, 9).then(response => {
            setPosts(prevPosts => {
                const newPosts = response.data.content;
                const existingIds = new Set(prevPosts.map(p => p.id));
                const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                return page === 0 ? newPosts : [...prevPosts, ...uniqueNewPosts];
            });
            setHasMore(!response.data.last);
            setLoading(false);
        }).catch(err => {
            setError('Failed to fetch blog posts.');
            setLoading(false);
        });
    }, [page, selectedCategory, searchTerm]);

    useEffect(() => {
        getCategories().then(response => {
            setCategories(response.data);
        }).catch(err => console.error("Failed to fetch categories:", err))
        .finally(() => setLoadingCategories(false));
    }, []);

    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") {
            postsToFilter = postsToFilter.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term));
        }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    useEffect(() => {
        if (filteredPosts.length === 0) { setOrientationsLoading(false); return; }
        setOrientationsLoading(true);
        const checkOrientations = async () => {
            const orientations = {};
            const promises = filteredPosts.map(post => { if (post.thumbnails && post.thumbnails.length > 0) { return new Promise(resolve => { const img = new Image(); img.src = `${API_URL}/api/uploads/${post.thumbnails[0].imageUrl}.webp`; img.onload = () => { orientations[post.thumbnails[0].id] = img.naturalWidth >= img.naturalHeight ? 'landscape' : 'portrait'; resolve(); }; img.onerror = () => { orientations[post.thumbnails[0].id] = 'landscape'; resolve(); }; }); } return Promise.resolve(); });
            await Promise.all(promises);
            setImageOrientations(orientations);
            setOrientationsLoading(false);
        };
        checkOrientations();
    }, [filteredPosts]);
   
    const mobileLayout = useMemo(() => {
        const layout = []; let i = 0;
        while (i < filteredPosts.length) {
            const post1 = filteredPosts[i]; const isPost1Story = post1.thumbnails && post1.thumbnails.length > 1; const post1ThumbnailId = post1.thumbnails?.[0]?.id; const isPost1Landscape = post1ThumbnailId ? imageOrientations[post1ThumbnailId] === 'landscape' : true;
            if (isPost1Story && isPost1Landscape) { layout.push({ ...post1, layout: 'banner' }); i++; } else {
                layout.push({ ...post1, layout: 'grid' }); const post2 = filteredPosts[i + 1];
                if (post2) { const isPost2Story = post2.thumbnails && post2.thumbnails.length > 1; const post2ThumbnailId = post2.thumbnails?.[0]?.id; const isPost2Landscape = post2ThumbnailId ? imageOrientations[post2ThumbnailId] === 'landscape' : true; if (!isPost2Story || !isPost2Landscape) { layout.push({ ...post2, layout: 'grid' }); i += 2; } else { i++; } } else { i++; }
            }
        } return layout;
    }, [filteredPosts, imageOrientations]);

    const desktopLayoutBlocks = useMemo(() => {
        if (filteredPosts.length === 0) return [];
        const blocks = []; let currentDefaultBlock = []; const multiColumnGroups = {};
        filteredPosts.forEach(post => { if (post.layoutStyle && post.layoutStyle.startsWith('MULTI_COLUMN') && post.layoutGroupId) { if (!multiColumnGroups[post.layoutGroupId]) { multiColumnGroups[post.layoutGroupId] = { type: post.layoutStyle, posts: [] }; } multiColumnGroups[post.layoutGroupId].posts.push(post); } });
        for (const groupId in multiColumnGroups) { multiColumnGroups[groupId].posts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); }
        const processedGroupIds = new Set();
        filteredPosts.forEach(post => {
            const style = post.layoutStyle || 'DEFAULT';
            if (style === 'BANNER') { if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); currentDefaultBlock = []; } blocks.push({ id: `banner-${post.id}`, type: 'BANNER', posts: [post] }); } else if (style.startsWith('MULTI_COLUMN') && post.layoutGroupId) { if (processedGroupIds.has(post.layoutGroupId)) return; if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); currentDefaultBlock = []; } blocks.push({ id: post.layoutGroupId, ...multiColumnGroups[post.layoutGroupId] }); processedGroupIds.add(post.layoutGroupId); } else { currentDefaultBlock.push(post); }
        });
        if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); }
        return blocks;
    }, [filteredPosts]);

    const latestPost = useMemo(() => { if (!posts || posts.length === 0) return null; return posts.reduce((latest, current) => new Date(current.updatedAt || current.createdAt) > new Date(latest.updatedAt || latest.createdAt) ? current : latest); }, [posts]);
    const pageTitle = latestPost ? `Treishvaam Finance · ${latestPost.title}` : `Treishvaam Finance | Financial News & Analysis`;
    const pageDescription = latestPost ? createSnippet(latestPost.content) : "Your trusted source for financial news and analysis.";
    const imageUrl = latestPost?.thumbnails?.[0]?.imageUrl ? `${API_URL}/api/uploads/${latestPost.thumbnails[0].imageUrl}.webp` : "/logo512.png";
    const marketSliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false };

    const renderDesktopLayout = () => {
        if (desktopLayoutBlocks.length === 0 && !loading && page === 0) { return <div className="text-center p-10 col-span-full"><p>No posts found for your criteria.</p></div>; }
        return desktopLayoutBlocks.map((block, blockIndex) => {
            const isLastBlock = blockIndex === desktopLayoutBlocks.length - 1;
            const blockStyle = { marginBottom: '2rem' };
            if (block.type === 'BANNER') {
                const isLastPost = isLastBlock && block.posts.length === 1;
                return <BannerPostCard ref={isLastPost ? lastPostElementRef : null} key={block.id} article={block.posts[0]} onCategoryClick={setSelectedCategory} />;
            }
            if (block.type.startsWith('MULTI_COLUMN')) {
                const columnCount = parseInt(block.type.split('_')[2]) || 2;
                const gridClass = `grid grid-cols-1 md:grid-cols-${columnCount} gap-px`;
                return (<div style={blockStyle} key={block.id} className={gridClass}>{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <GridPostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={setSelectedCategory} />; })}</div>);
            }
            if (block.type === 'DEFAULT') {
                return (<div style={blockStyle} key={block.id} className="sm:columns-2 md:columns-3 lg:columns-4 gap-px">{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <PostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={setSelectedCategory} />; })}</div>);
            }
            return null;
        });
    };

    if (page === 0 && loading) return <div className="text-center p-10">Loading posts...</div>;
    if (error) return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50"><div className="text-red-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-semibold text-gray-800 mb-2">Site is Currently Under Maintenance</h2><p className="max-w-md text-gray-600">We are performing essential updates to improve your experience. We apologize for any inconvenience and appreciate your patience. Please check back again shortly.</p></div>);

    return (
        <><DevelopmentNotice /><Helmet><title>{pageTitle}</title><meta name="description" content={pageDescription} /><meta property="og:title" content={pageTitle} /><meta property="og:description" content={pageDescription} /><meta property="og:image" content={imageUrl} /></Helmet>
       
        <NavbarExtrasPortal>
            <div className="w-64">
                <SearchAutocomplete />
            </div>
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                loadingCategories={loadingCategories}
            />
            <h1 className="text-xl font-bold text-gray-900 hidden lg:block">Finance <span className="text-sky-600">World</span></h1>
        </NavbarExtrasPortal>

        <section className="bg-gray-50">
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2">
                <aside className="lg:col-span-2 order-1 py-6"><div className="space-y-4"><NewsHighlights /><DeeperDive /></div></aside>
                <main className="lg:col-span-8 order-2 min-h-screen py-6 bg-white">{renderDesktopLayout()}{loading && <div className="text-center p-10 col-span-full">Loading more posts...</div>}{!hasMore && filteredPosts.length > 0 && <div className="text-center p-10 col-span-full text-gray-500">You've reached the end.</div>}</main>
                <aside className="lg:col-span-2 order-3 py-6"><div className="space-y-6"><IndexCharts /><MarketMovers /></div></aside>
            </div>
            <div className="sm:hidden">
                <div className="px-4 py-4"><div className="border-b border-gray-200 mb-4"><button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex justify-between items-center py-3 text-lg font-semibold text-gray-800">{showMobileFilters ? 'Hide Filters' : 'Filters & Categories'}{showMobileFilters ? <FiX /> : <FiFilter />}</button>{showMobileFilters && (<div className="py-4"><BlogSidebar categories={categories} selectedCategory={setSelectedCategory} setSelectedCategory={setSelectedCategory} loadingCategories={loadingCategories} /></div>)}</div></div>
                <div className="px-4"><NewsHighlights /></div>
                {orientationsLoading ? (<div className="text-center p-10">Loading Layout...</div>) : (mobileLayout.length > 0 ? (<div className="grid grid-cols-2 gap-2 p-2">{mobileLayout.map((article, index) => { const isLastPost = index === mobileLayout.length - 1; return <MobilePostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={setSelectedCategory} layout={article.layout} />; })}</div>) : (<div className="text-center py-10 px-4"><p>No posts found for your criteria.</p></div>))}
                {loading && <div className="text-center p-4">Loading...</div>}
                {!hasMore && mobileLayout.length > 0 && <div className="text-center p-4 text-gray-500">You've reached the end.</div>}
                <div className="px-4 pb-4"><div className="mt-8 pt-6 border-t border-gray-200"><h3 className="text-xl font-bold text-gray-900 mb-4">Market Movers</h3><div className="market-slider-container pb-6 -mx-2"><style>{`.market-slider-container .slick-dots li button:before { font-size: 10px; color: #9ca3af; } .market-slider-container .slick-dots li.slick-active button:before { color: #0284c7; }`}</style><Slider {...marketSliderSettings}><div className="px-2"><TopMoversCard title="Most Active" fetchData={getMostActive} type="active" /></div><div className="px-2"><TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" /></div><div className="px-2"><TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" /></div></Slider></div><div className="mt-8"><IndexCharts /></div></div></div>
            </div>
        </section></>
    );
};
export default BlogPage;