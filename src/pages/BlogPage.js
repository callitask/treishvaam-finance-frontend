import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getPaginatedPosts } from '../apiConfig';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiTrendingUp, FiLayers, FiTarget, FiAlertCircle } from 'react-icons/fi';

// Layout components
import FeaturedColumn from '../components/BlogPage/FeaturedColumn';
import MarketSidebar from '../components/BlogPage/MarketSidebar';
import BlogGridDesktop from '../components/BlogPage/BlogGridDesktop';
import BlogSlideMobile from '../components/BlogPage/BlogSlideMobile';
import MarketSlideMobile from '../components/BlogPage/MarketSlideMobile';
import NewsTabMobile from '../components/BlogPage/NewsTabMobile';
import VisionPage from './VisionPage';

// --- Category Filter (Desktop) ---
const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

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
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-sky-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedCategory === cat ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
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

    // --- Mobile Tab State ---
    const [activeTab, setActiveTab] = useState('home');

    // --- Infinite Scroll ---
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

    // --- Data Fetching ---
    useEffect(() => { setPosts([]); setPage(0); setHasMore(true); }, [selectedCategory, searchTerm]);

    useEffect(() => {
        if (!isDataReady) return;
        setLoading(true); setError('');
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
    }, [page, selectedCategory, searchTerm, isDataReady]);

    useEffect(() => {
        getCategories().then(response => {
            setCategories(response.data);
            const newCategoriesMap = response.data.reduce((acc, cat) => { acc[cat.name] = cat.slug; return acc; }, {});
            setCategoriesMap(newCategoriesMap);
        }).catch(err => console.error("Failed to fetch categories:", err))
            .finally(() => { setLoadingCategories(false); setIsDataReady(true); });
    }, []);

    // --- Filtering ---
    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") { postsToFilter = postsToFilter.filter(p => p.category?.name === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term)); }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    // --- Layout ---
    const mobileLayout = useMemo(() => {
        return filteredPosts.map(post => ({ ...post }));
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

    const pageTitle = "Treishfin · Treishvaam Finance | Financial News & Analysis";
    const pageDescription = "Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance.";
    const canonicalUrl = "https://treishfin.treishvaamgroup.com/";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Treishvaam Finance",
        "url": canonicalUrl
    };

    // --- Render States ---

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">Unable to load content</h3>
                <p className="text-sm text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-sky-600 text-white rounded-full font-semibold shadow-md hover:bg-sky-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (page === 0 && loading && !isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center text-gray-500">Loading content...</div>;

    // --- Mobile Bottom Nav ---
    const MobileBottomNav = () => (
        <nav className="fixed bottom-0 left-0 right-0 h-16 glass-nav z-[90] flex justify-around items-center px-2 safe-pb">
            <button onClick={() => { setActiveTab('home'); window.scrollTo(0, 0); }} className={`flex flex-col items-center justify-center w-1/4 h-full space-y-1 ${activeTab === 'home' ? 'text-sky-600' : 'text-gray-400'}`}>
                <FiHome size={22} className={activeTab === 'home' ? 'fill-current' : ''} />
                <span className="text-[10px] font-medium tracking-wide">Home</span>
            </button>
            <button onClick={() => { setActiveTab('markets'); window.scrollTo(0, 0); }} className={`flex flex-col items-center justify-center w-1/4 h-full space-y-1 ${activeTab === 'markets' ? 'text-sky-600' : 'text-gray-400'}`}>
                <FiTrendingUp size={22} />
                <span className="text-[10px] font-medium tracking-wide">Markets</span>
            </button>
            <button onClick={() => { setActiveTab('briefs'); window.scrollTo(0, 0); }} className={`flex flex-col items-center justify-center w-1/4 h-full space-y-1 ${activeTab === 'briefs' ? 'text-sky-600' : 'text-gray-400'}`}>
                <FiLayers size={22} />
                <span className="text-[10px] font-medium tracking-wide">News</span>
            </button>
            <button onClick={() => { setActiveTab('vision'); window.scrollTo(0, 0); }} className={`flex flex-col items-center justify-center w-1/4 h-full space-y-1 ${activeTab === 'vision' ? 'text-sky-600' : 'text-gray-400'}`}>
                <FiTarget size={22} />
                <span className="text-[10px] font-medium tracking-wide">Vision</span>
            </button>
        </nav>
    );

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
            </Helmet>

            <section className="bg-gray-50 min-h-screen">

                {/* --- DESKTOP VIEW --- */}
                <div className="hidden sm:block">
                    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-20">
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 container mx-auto px-4 pt-6">
                        <aside className="lg:col-span-2 order-1 space-y-6"><FeaturedColumn /></aside>
                        <div className="lg:col-span-8 order-2">
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
                        <aside className="lg:col-span-2 order-3 space-y-6"><MarketSidebar /></aside>
                    </div>
                </div>

                {/* --- MOBILE VIEW --- */}
                <div className="sm:hidden pb-20">
                    {activeTab === 'home' && (
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
                    )}

                    {activeTab === 'markets' && (
                        <div className="animate-in fade-in duration-200">
                            <MarketSlideMobile />
                        </div>
                    )}

                    {activeTab === 'briefs' && (
                        <div className="animate-in fade-in duration-200">
                            <NewsTabMobile />
                        </div>
                    )}

                    {activeTab === 'vision' && (
                        <div className="animate-in fade-in duration-200">
                            <VisionPage />
                        </div>
                    )}

                    <MobileBottomNav />
                </div>
            </section>
        </>
    );
};

export default BlogPage;