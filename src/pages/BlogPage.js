import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getPaginatedPosts } from '../apiConfig';
import { Helmet } from 'react-helmet-async';
import { FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import DevelopmentNotice from '../components/DevelopmentNotice';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import new layout components
import FeaturedColumn from '../components/BlogPage/FeaturedColumn';
import MarketSidebar from '../components/BlogPage/MarketSidebar';
import BlogGridDesktop from '../components/BlogPage/BlogGridDesktop';
import BlogSlideMobile from '../components/BlogPage/BlogSlideMobile';
import MarketSlideMobile from '../components/BlogPage/MarketSlideMobile';

// Category Filter Component (Moved inline for cleaner access)
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    if (loadingCategories) return <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-md"></div>;

    return (
        <div className="relative z-30">
            <button
                type="button"
                className="w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-200 hover:bg-gray-50 text-sm font-bold text-gray-700 flex justify-between items-center uppercase tracking-wide"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                {selectedCategory}
                <svg className={`h-4 w-4 transition-transform duration-200 text-gray-500 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 py-1 max-h-64 overflow-y-auto">
                    {allCategories.map(cat => (
                        <button
                            key={cat}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedCategory === cat ? 'font-bold text-sky-700 bg-sky-50' : 'text-gray-700'}`}
                            onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                        >
                            {cat}
                        </button>
                    ))}
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

    useEffect(() => {
        setPosts([]); setPage(0); setHasMore(true);
    }, [selectedCategory, searchTerm]);

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
        } else {
            setLoading(false);
        }
    }, [page, selectedCategory, searchTerm, isDataReady, activeMobileViewIndex]);

    useEffect(() => {
        getCategories().then(response => {
            setCategories(response.data);
            const newCategoriesMap = response.data.reduce((acc, cat) => { acc[cat.name] = cat.slug; return acc; }, {});
            setCategoriesMap(newCategoriesMap);
        }).catch(err => console.error("Failed to fetch categories:", err))
            .finally(() => { setLoadingCategories(false); setIsDataReady(true); });
    }, []);

    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") { postsToFilter = postsToFilter.filter(p => p.category?.name === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term)); }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

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
            } else {
                currentDefaultBlock.push(post);
            }
        });
        if (currentDefaultBlock.length > 0) { blocks.push({ id: `default-${blocks.length}`, type: 'DEFAULT', posts: currentDefaultBlock }); }
        return blocks;
    }, [filteredPosts]);

    const pageTitle = "Treishfin · Treishvaam Finance | Financial News & Analysis";
    const pageDescription = "Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance.";
    const imageUrl = "/logo.webp";

    const mobileMainSliderSettings = {
        dots: false, infinite: false, speed: 500, slidesToShow: 1, slidesToScroll: 1,
        arrows: false, swipeToSlide: true, initialSlide: 1,
        afterChange: (index) => setActiveMobileViewIndex(index)
    };

    const navigateMobile = (index) => {
        setActiveMobileViewIndex(index);
        if (mobileSliderRef && mobileSliderRef.current && typeof mobileSliderRef.current.slickGoTo === 'function') {
            mobileSliderRef.current.slickGoTo(index);
        }
    };

    if (page === 0 && loading && !isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center">Loading initial data...</div>;
    if (page === 0 && loading && isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center">Loading posts...</div>;
    if (error) return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50"><div className="text-red-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-semibold text-gray-800 mb-2">Site is Currently Under Maintenance</h2><p className="max-w-md text-gray-600">We are performing essential updates to improve your experience. Please check back again shortly.</p></div>);

    return (
        <>
            <DevelopmentNotice />
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href="https://treishfin.treishvaamgroup.com/" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={imageUrl} />
            </Helmet>

            <section className="bg-gray-50 pb-16 sm:pb-0 min-h-screen">
                {/* --- Desktop Header Area (Title & Filters) --- */}
                <div className="hidden sm:block container mx-auto px-4 pt-6 pb-2">
                    <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-gray-200 pb-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 font-serif tracking-tight">
                                Financial News & Market Analysis
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Stay informed with real-time updates and expert insights.</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <CategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                loadingCategories={loadingCategories}
                            />
                        </div>
                    </div>
                </div>

                <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2 container mx-auto px-2">
                    <aside className="lg:col-span-2 order-1 py-2 px-2">
                        <FeaturedColumn />
                    </aside>

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

                    <aside className="lg:col-span-2 order-3 py-2 px-2">
                        <MarketSidebar />
                    </aside>
                </div>

                <div className="sm:hidden">
                    <Slider ref={mobileSliderRef} {...mobileMainSliderSettings}>
                        <div className="p-4 outline-none space-y-4">
                            <FeaturedColumn />
                        </div>

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

                        <MarketSlideMobile />
                    </Slider>
                </div>
            </section>

            <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-md z-50 flex justify-around items-center">
                <button onClick={() => navigateMobile(0)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 ${activeMobileViewIndex === 0 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}><FiBriefcase className="w-6 h-6 mb-1" /><span className="text-xs font-medium">News</span></button>
                <button onClick={() => navigateMobile(1)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 relative ${activeMobileViewIndex === 1 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}>{activeMobileViewIndex === 1 && <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-sky-600 rounded-b-full"></span>}<img src="/logo.webp" alt="TreishFin Home" className="w-10 h-10 object-contain mb-1" /></button>
                <button onClick={() => navigateMobile(2)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 ${activeMobileViewIndex === 2 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}><FiTrendingUp className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Market</span></button>
            </div>
        </>
    );
};
export default BlogPage;