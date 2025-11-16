import React, { useState, useEffect, useMemo, memo, useRef, useCallback, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { API_URL, getCategories, getPaginatedPosts } from '../apiConfig';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX, FiTrendingUp, FiBriefcase } from 'react-icons/fi';
import DevelopmentNotice from '../components/DevelopmentNotice';
// Note: We're not importing BlogSidebar here anymore, it's used inside BlogSlideMobile
import SearchAutocomplete from '../components/SearchAutocomplete';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import new layout components
import FeaturedColumn from '../components/BlogPage/FeaturedColumn';
import MarketSidebar from '../components/BlogPage/MarketSidebar';
import BlogGridDesktop from '../components/BlogPage/BlogGridDesktop';
import BlogSlideMobile from '../components/BlogPage/BlogSlideMobile';
import MarketSlideMobile from '../components/BlogPage/MarketSlideMobile';

// Import helpers
import { createSnippet } from '../utils/blogUtils';

// --- CategoryFilter (Unchanged) ---
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const allCategories = ['All', ...categories.map(cat => cat.name)];
    if (loadingCategories) return <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>;
    return (
        <div className="relative">
            <button type="button" className="w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200 hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {selectedCategory}
                <svg className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isDropdownOpen && (<div className="absolute z-20 mt-2 w-full origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-100 ease-in-out"><div className="py-1">{allCategories.map(cat => (<div key={cat} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer" onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}>{cat}</div>))}</div></div>)}
        </div>
    );
};

// --- NavbarExtrasPortal (Unchanged) ---
const NavbarExtrasPortal = ({ children }) => {
    const [mountNode, setMountNode] = useState(null);
    useEffect(() => {
        const node = document.getElementById('navbar-extras-portal-target');
        setMountNode(node);
        return () => { if (node) { node.innerHTML = ''; } };
    }, []);
    return mountNode ? createPortal(children, mountNode) : null;
};

// --- BlogPage Component ---
const BlogPage = () => {
    // State including mobile slider state
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    // const [showMobileFilters, setShowMobileFilters] = useState(false); // This state is now inside BlogSlideMobile
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q') || "";
    const [categoriesMap, setCategoriesMap] = useState({});
    const [isDataReady, setIsDataReady] = useState(false);
    const [activeMobileViewIndex, setActiveMobileViewIndex] = useState(1); // Default to Blog view
    const mobileSliderRef = useRef(null); // Ref for mobile slider instance

    // Infinite scroll observer - Adjusted for mobile tabs
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        // Original logic for desktop observer
        if (typeof window !== 'undefined' && window.innerWidth >= 640) { // sm breakpoint check
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prevPage => prevPage + 1);
                }
            });
            if (node) observer.current.observe(node);
        }
        // Mobile observer logic (only attach if blog tab active)
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

    // useEffect for resetting posts
    useEffect(() => {
        setPosts([]); setPage(0); setHasMore(true);
    }, [selectedCategory, searchTerm]);

    // useEffect for fetching posts - Adjusted for mobile tabs
    useEffect(() => {
        if (!isDataReady) return;
        // Fetch if desktop OR if mobile blog tab is active
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
            setLoading(false); // Ensure loading is false if not fetching on mobile non-blog tabs
        }
    }, [page, selectedCategory, searchTerm, isDataReady, activeMobileViewIndex]);

    // useEffect for fetching categories
    useEffect(() => {
        getCategories().then(response => {
            setCategories(response.data);
            const newCategoriesMap = response.data.reduce((acc, cat) => { acc[cat.name] = cat.slug; return acc; }, {});
            setCategoriesMap(newCategoriesMap);
        }).catch(err => console.error("Failed to fetch categories:", err))
            .finally(() => { setLoadingCategories(false); setIsDataReady(true); });
    }, []);

    // filteredPosts memo
    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") { postsToFilter = postsToFilter.filter(p => p.category?.name === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term)); }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    // mobileLayout memo from user prompt code
    const mobileLayout = useMemo(() => {
        return filteredPosts.map(post => {
            const isStory = post.thumbnails && post.thumbnails.length > 1;
            const layout = isStory ? 'banner' : 'grid';
            return { ...post, layout };
        });
    }, [filteredPosts]);

    // desktopLayoutBlocks memo from user prompt code
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


    // Helmet variables
    const latestPost = useMemo(() => { if (!posts || posts.length === 0) return null; return posts.reduce((latest, current) => new Date(current.updatedAt || current.createdAt) > new Date(latest.updatedAt || latest.createdAt) ? current : latest); }, [posts]);
    const pageTitle = latestPost ? `Treishvaam Finance · ${latestPost.title}` : `Treishvaam Finance | Financial News & Analysis`;
    const pageDescription = latestPost ? createSnippet(latestPost.content) : "Your trusted source for financial news and analysis.";

    // FIXED: Changed /logo512.png to /logo.webp
    const imageUrl = latestPost?.thumbnails?.[0]?.imageUrl ? `${API_URL}/api/uploads/${latestPost.thumbnails[0].imageUrl}.webp` : "/logo.webp";

    // Slider settings
    const mobileMainSliderSettings = { // Settings for the new mobile tab slider
        dots: false, infinite: false, speed: 500, slidesToShow: 1, slidesToScroll: 1,
        arrows: false, swipeToSlide: true, initialSlide: 1, // Start on Blog view (index 1)
        afterChange: (index) => setActiveMobileViewIndex(index) // Update state on swipe
    };

    // navigateMobile function (for bottom bar)
    const navigateMobile = (index) => {
        // Update state immediately for responsive tab highlight, then navigate slider
        setActiveMobileViewIndex(index);
        if (mobileSliderRef && mobileSliderRef.current && typeof mobileSliderRef.current.slickGoTo === 'function') {
            mobileSliderRef.current.slickGoTo(index);
        }
    };

    // Original Loading/Error states from user prompt
    // Use isDataReady check for initial loading
    if (page === 0 && loading && !isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center">Loading initial data...</div>;
    if (page === 0 && loading && isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center">Loading posts...</div>; // Loading posts state
    if (error) return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-gray-50"><div className="text-red-400 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><h2 className="text-2xl font-semibold text-gray-800 mb-2">Site is Currently Under Maintenance</h2><p className="max-w-md text-gray-600">We are performing essential updates to improve your experience. We apologize for any inconvenience and appreciate your patience. Please check back again shortly.</p></div>);

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

            <NavbarExtrasPortal>
                {/* Desktop Navbar Extras */}
                <div className="hidden sm:flex items-center gap-4">
                    <div className="w-64"><SearchAutocomplete /></div>
                    <CategoryFilter categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} loadingCategories={loadingCategories} />
                    <h1 className="text-xl font-bold text-gray-900 hidden lg:block">Finance <span className="text-sky-600">World</span></h1>
                </div>
            </NavbarExtrasPortal>

            <section className="bg-gray-50 pb-16 sm:pb-0">
                {/* --- Desktop Layout --- */}
                <div className="hidden sm:grid grid-cols-1 lg:grid-cols-12 gap-2">

                    {/* Left Column (News & Dive) */}
                    <aside className="lg:col-span-2 order-1 py-6 px-2">
                        <FeaturedColumn />
                    </aside>

                    {/* Center Column (Blog Grid) */}
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

                    {/* Right Column (Market Info) */}
                    <aside className="lg:col-span-2 order-3 py-6 px-2">
                        <MarketSidebar />
                    </aside>
                </div>

                {/* --- Mobile Layout (Slider Implementation) --- */}
                <div className="sm:hidden">
                    <Slider ref={mobileSliderRef} {...mobileMainSliderSettings}>

                        {/* Slide 0: News */}
                        <div className="p-4 outline-none space-y-4">
                            <FeaturedColumn />
                        </div>

                        {/* Slide 1: Blog */}
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

                        {/* Slide 2: Market */}
                        <MarketSlideMobile />

                    </Slider>
                </div>
            </section>

            {/* --- Mobile Bottom Navigation (fixed bottom tab bar) --- */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-md z-50 flex justify-around items-center">
                <button onClick={() => navigateMobile(0)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 ${activeMobileViewIndex === 0 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}><FiBriefcase className="w-6 h-6 mb-1" /><span className="text-xs font-medium">News</span></button>
                <button onClick={() => navigateMobile(1)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 relative ${activeMobileViewIndex === 1 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}>{activeMobileViewIndex === 1 && <span className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-sky-600 rounded-b-full"></span>}<img src="/logo.webp" alt="TreishFin Home" className="w-10 h-10 object-contain mb-1" /></button>
                <button onClick={() => navigateMobile(2)} className={`flex flex-col items-center justify-center w-1/3 h-full transition-colors duration-200 ${activeMobileViewIndex === 2 ? 'text-sky-600' : 'text-gray-500 hover:text-sky-500'}`}><FiTrendingUp className="w-6 h-6 mb-1" /><span className="text-xs font-medium">Market</span></button>
            </div>
        </>
    );
};
export default BlogPage;