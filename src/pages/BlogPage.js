import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getPaginatedPosts } from '../apiConfig';
import { Helmet } from 'react-helmet-async';
import { FiTrendingUp, FiBriefcase, FiChevronDown, FiFilter, FiX } from 'react-icons/fi';
import DevelopmentNotice from '../components/DevelopmentNotice';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import layout components
import FeaturedColumn from '../components/BlogPage/FeaturedColumn';
import MarketSidebar from '../components/BlogPage/MarketSidebar';
import BlogGridDesktop from '../components/BlogPage/BlogGridDesktop';
import BlogSlideMobile from '../components/BlogPage/BlogSlideMobile';
import MarketSlideMobile from '../components/BlogPage/MarketSlideMobile';

// --- Re-Mastered Category Filter ---
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loadingCategories) return <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-lg"></div>;

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <button
                type="button"
                className="group flex items-center justify-between w-48 px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-sky-500 hover:ring-1 hover:ring-sky-500 transition-all duration-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <span className={`text-sm font-semibold truncate ${selectedCategory === 'All' ? 'text-gray-600' : 'text-sky-700'}`}>
                    {selectedCategory}
                </span>
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-sky-500' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory === cat
                                        ? 'bg-sky-50 text-sky-700 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
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
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q') || "";
    const [categoriesMap, setCategoriesMap] = useState({});
    const [isDataReady, setIsDataReady] = useState(false);
    const [activeMobileViewIndex, setActiveMobileViewIndex] = useState(1);
    const mobileSliderRef = useRef(null);

    // --- Infinite Scroll Logic (Preserved) ---
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (typeof window !== 'undefined' && window.innerWidth >= 640) {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        }
        else {
            if (activeMobileViewIndex !== 1) { if (observer.current) observer.current.disconnect(); return; };
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        }
    }, [loading, hasMore, activeMobileViewIndex]);

    // --- Data Fetching (Preserved) ---
    useEffect(() => { setPosts([]); setPage(0); setHasMore(true); }, [selectedCategory, searchTerm]);

    useEffect(() => {
        if (!isDataReady) return;
        if (typeof window !== 'undefined' && (window.innerWidth >= 640 || activeMobileViewIndex === 1)) {
            setLoading(true); setError('');
            getPaginatedPosts(page, 9).then(response => {
                setPosts(prevPosts => {
                    const newPosts = response.data.content;
                    const existingIds = new Set(prevPosts.map(p => p.id));
                    const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                    return page === 0 ? newPosts : [...prevPosts, ...uniqueNewPosts];
                });
                setHasMore(!response.data.last); setLoading(false);
            }).catch(err => { setError('Failed to fetch blog posts.'); setLoading(false); });
        } else { setLoading(false); }
    }, [page, selectedCategory, searchTerm, isDataReady, activeMobileViewIndex]);

    useEffect(() => {
        getCategories().then(response => {
            setCategories(response.data);
            const newCategoriesMap = response.data.reduce((acc, cat) => { acc[cat.name] = cat.slug; return acc; }, {});
            setCategoriesMap(newCategoriesMap);
        }).catch(err => console.error("Failed to fetch categories:", err))
            .finally(() => { setLoadingCategories(false); setIsDataReady(true); });
    }, []);

    // --- Filtering Logic (Preserved) ---
    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") { postsToFilter = postsToFilter.filter(p => p.category?.name === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term)); }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    // --- Layout Logic (Preserved) ---
    const mobileLayout = useMemo(() => {
        return filteredPosts.map(post => {
            const isStory = post.thumbnails && post.thumbnails.length > 1;
            const layout = isStory ? 'banner' : 'grid';
            return { ...post, layout };
        });
    }, [filteredPosts]);

    const desktopLayoutBlocks = useMemo(() => {
        if (filteredPosts.length === 0) return [];
        const blocks = []; let currentDefaultBlock = []; const multiColumnGroups = {};
        filteredPosts.forEach(post => { if (post.layoutStyle && post.layoutStyle.startsWith('MULTI_COLUMN') && post.layoutGroupId) { if (!multiColumnGroups[post.layoutGroupId]) { multiColumnGroups[post.layoutGroupId] = { type: post.layoutStyle, posts: [] }; } multiColumnGroups[post.layoutGroupId].posts.push(post); } });
        for (const groupId in multiColumnGroups) { multiColumnGroups[groupId].posts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); }
        const processedGroupIds = new Set();
        filteredPosts.forEach(post => {
            const style = post.layoutStyle || 'DEFAULT';
            if (style === 'BANNER') {
                if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); currentDefaultBlock = []; }
                blocks.push({ id: `banner-${post.id}`, type: 'BANNER', posts: [post] });
            } else if (style.startsWith('MULTI_COLUMN') && post.layoutGroupId) {
                if (processedGroupIds.has(post.layoutGroupId)) return;
                if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); currentDefaultBlock = []; }
                blocks.push({ id: post.layoutGroupId, ...multiColumnGroups[post.layoutGroupId] });
                processedGroupIds.add(post.layoutGroupId);
            } else { currentDefaultBlock.push(post); }
        });
        if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); }
        return blocks;
    }, [filteredPosts]);

    // --- SEO Data ---
    const pageTitle = "Treishfin · Treishvaam Finance | Financial News & Analysis";
    const pageDescription = "Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance. Your daily source for insights on stocks, crypto, and trading.";
    const imageUrl = "https://treishfin.treishvaamgroup.com/logo.webp";
    const canonicalUrl = "https://treishfin.treishvaamgroup.com/";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Treishvaam Finance",
        "url": canonicalUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://treishfin.treishvaamgroup.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    };

    // Mobile Navigation Logic
    const mobileMainSliderSettings = {
        dots: false, infinite: false, speed: 500, slidesToShow: 1, slidesToScroll: 1,
        arrows: false, swipeToSlide: true, initialSlide: 1,
        afterChange: (index) => setActiveMobileViewIndex(index)
    };
    const navigateMobile = (index) => {
        setActiveMobileViewIndex(index);
        if (mobileSliderRef && mobileSliderRef.current) {
            mobileSliderRef.current.slickGoTo(index);
        }
    };

    if (page === 0 && loading && !isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center text-gray-500">Loading content...</div>;
    if (error) return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50"><div className="text-red-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-semibold text-gray-800 mb-2">Service Unavailable</h2><p className="max-w-md text-gray-600">We're updating our financial systems. Please check back shortly.</p></div>);

    return (
        <>
            <DevelopmentNotice />
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
                <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
            </Helmet>

            <section className="bg-gray-50 pb-16 sm:pb-0 min-h-screen">
                {/* --- Redesigned Desktop Header --- */}
                <div className="hidden sm:block bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-20">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 font-serif tracking-tight flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                                    Market Analysis & News
                                </h1>
                                <p className="text-sm text-gray-500 mt-1 pl-3.5">Real-time insights for smarter investing.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Filter by:</span>
                                <CategoryFilter
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    setSelectedCategory={setSelectedCategory}
                                    loadingCategories={loadingCategories}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Grid --- */}
                <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-6 container mx-auto px-4 pt-6">
                    {/* Left: News & Deeper Dive */}
                    <aside className="lg:col-span-3 xl:col-span-2 order-1 space-y-6">
                        <FeaturedColumn />
                    </aside>

                    {/* Center: Blog Grid */}
                    <div className="lg:col-span-6 xl:col-span-7 order-2">
                        <BlogGridDesktop
                            desktopLayoutBlocks={desktopLayoutBlocks}
                            lastPostElementRef={lastPostElementRef}
                            onCategoryClick={setSelectedCategory}
                            categoriesMap={categoriesMap}
                            loading={loading}
                            page={page}
                            hasMore={hasMore}
                            postCount={filteredPosts.length}
                        />
                    </div>

                    {/* Right: Market Data */}
                    <aside className="lg:col-span-3 order-3 space-y-6">
                        <MarketSidebar />
                    </aside>
                </div>

                {/* --- Mobile Layout --- */}
                <div className="sm:hidden">
                    <Slider ref={mobileSliderRef} {...mobileMainSliderSettings}>
                        <div className="p-4 outline-none space-y-4 h-[calc(100vh-64px)] overflow-y-auto">
                            <FeaturedColumn />
                        </div>

                        <div className="h-[calc(100vh-64px)] overflow-y-auto">
                            <BlogSlideMobile
                                mobileLayout={mobileLayout}
                                lastPostElementRef={lastPostElementRef}
                                onCategoryClick={setSelectedCategory}
                                categoriesMap={categoriesMap}
                                categories={categories}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                loadingCategories={loadingCategories}
                                loading={loading}
                                page={page}
                                hasMore={hasMore}
                            />
                        </div>

                        <div className="h-[calc(100vh-64px)] overflow-y-auto">
                            <MarketSlideMobile />
                        </div>
                    </Slider>
                </div>
            </section>

            {/* --- Mobile Bottom Nav --- */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center">
                <button onClick={() => navigateMobile(0)} className={`flex flex-col items-center justify-center w-1/3 h-full ${activeMobileViewIndex === 0 ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <FiBriefcase className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">News</span>
                </button>
                <button onClick={() => navigateMobile(1)} className="flex flex-col items-center justify-center w-1/3 h-full relative">
                    <div className={`absolute -top-6 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100 ${activeMobileViewIndex === 1 ? 'ring-2 ring-sky-500 ring-offset-2' : ''}`}>
                        <img src="/logo.webp" alt="Home" className="w-8 h-8 object-contain" />
                    </div>
                    <span className={`absolute bottom-2 text-[10px] font-medium uppercase tracking-wide ${activeMobileViewIndex === 1 ? 'text-sky-600' : 'text-gray-400'}`}>Feed</span>
                </button>
                <button onClick={() => navigateMobile(2)} className={`flex flex-col items-center justify-center w-1/3 h-full ${activeMobileViewIndex === 2 ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'}`}>
                    <FiTrendingUp className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wide">Market</span>
                </button>
            </div>
        </>
    );
};

export default BlogPage;