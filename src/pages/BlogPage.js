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

// NEW COMPONENTS (Phases 2 & 3)
import CategoryStrip from '../components/BlogPage/CategoryStrip';
import GlobalMarketTicker from '../components/market/GlobalMarketTicker';
import HeroSection from '../components/BlogPage/HeroSection';

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

    // --- Separation for Hero Section ---
    const { heroPost, gridPosts } = useMemo(() => {
        if (filteredPosts.length > 0) {
            return {
                heroPost: filteredPosts[0],
                gridPosts: filteredPosts.slice(1)
            };
        }
        return { heroPost: null, gridPosts: [] };
    }, [filteredPosts]);

    // --- Layout ---
    const mobileLayout = useMemo(() => {
        return filteredPosts.map(post => ({ ...post }));
    }, [filteredPosts]);

    const desktopLayoutBlocks = useMemo(() => {
        if (gridPosts.length === 0) return [];
        const blocks = []; let currentDefaultBlock = []; const multiColumnGroups = {};
        gridPosts.forEach(post => { if (post.layoutStyle && post.layoutStyle.startsWith('MULTI_COLUMN') && post.layoutGroupId) { if (!multiColumnGroups[post.layoutGroupId]) { multiColumnGroups[post.layoutGroupId] = { type: post.layoutStyle, posts: [] }; } multiColumnGroups[post.layoutGroupId].posts.push(post); } });
        for (const groupId in multiColumnGroups) { multiColumnGroups[groupId].posts.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)); }
        const processedGroupIds = new Set();
        gridPosts.forEach(post => {
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
    }, [gridPosts]);

    const pageTitle = "Treishfin · Treishvaam Finance | Financial News & Analysis";
    const pageDescription = "Stay ahead with the latest financial news, market updates, and expert analysis from Treishvaam Finance.";
    const canonicalUrl = "https://treishfin.treishvaamgroup.com/";

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Treishvaam Finance",
        "url": canonicalUrl
    };

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">Unable to load content</h3>
                <p className="text-sm text-gray-600 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-sky-600 text-white rounded-full font-semibold shadow-md hover:bg-sky-700 transition-colors">Retry</button>
            </div>
        );
    }

    if (page === 0 && loading && !isDataReady) return <div className="text-center p-10 min-h-screen flex items-center justify-center text-gray-500">Loading content...</div>;

    // --- ENTERPRISE MOBILE NAVIGATION (Glass) ---
    const MobileBottomNav = () => (
        <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[90] flex justify-around items-center px-2 safe-pb transition-all duration-300">
            {[
                { id: 'home', label: 'Home', icon: FiHome },
                { id: 'markets', label: 'Markets', icon: FiTrendingUp },
                { id: 'briefs', label: 'News', icon: FiLayers },
                { id: 'vision', label: 'Vision', icon: FiTarget }
            ].map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => { setActiveTab(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform duration-200 group ${activeTab === id ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Icon size={22} className={`transition-all duration-300 ${activeTab === id ? 'fill-current scale-110 drop-shadow-sm' : ''}`} />
                    <span className="text-[10px] font-bold tracking-wide">{label}</span>

                    {/* Active Indicator Dot */}
                    {activeTab === id && (
                        <span className="absolute bottom-1 w-1 h-1 bg-sky-600 rounded-full animate-in zoom-in"></span>
                    )}
                </button>
            ))}
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

            <section className="bg-white min-h-screen font-sans">

                {/* --- DESKTOP VIEW (3-COLUMN ENTERPRISE LAYOUT) --- */}
                <div className="hidden md:block">

                    {/* Category Strip */}
                    <div className="sticky top-[110px] z-40">
                        <CategoryStrip
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            loading={loadingCategories}
                        />
                    </div>

                    {/* Market Ticker */}
                    <div className="border-b border-gray-200 bg-gray-50/50">
                        <GlobalMarketTicker />
                    </div>

                    {/* Main Content Grid */}
                    <div className="container mx-auto px-4 lg:px-6 pt-10 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* COLUMN 1: THE BRIEFING (News Sidebar) - 2.5/12 */}
                            <aside className="lg:col-span-3 order-1 border-r border-gray-100 pr-6 hidden xl:block">
                                <div className="sticky top-40 space-y-8">
                                    <div className="border-b-2 border-black pb-2 mb-4">
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                                            The Briefing
                                        </h3>
                                    </div>
                                    <FeaturedColumn />
                                </div>
                            </aside>

                            {/* COLUMN 2: THE FEED (Hero + Grid) - 6.5/12 */}
                            <div className="lg:col-span-8 xl:col-span-6 order-2 px-0 lg:px-4">
                                {/* Lead Story */}
                                <HeroSection featuredPost={heroPost} />

                                {/* Section Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-2 h-8 bg-sky-600"></span>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight font-serif">
                                        Latest Analysis
                                    </h2>
                                </div>

                                {/* Main Feed */}
                                <BlogGridDesktop
                                    desktopLayoutBlocks={desktopLayoutBlocks}
                                    lastPostElementRef={lastPostElementRef}
                                    onCategoryClick={setSelectedCategory}
                                    categoriesMap={categoriesMap}
                                    loading={loading}
                                    page={page}
                                    hasMore={hasMore}
                                    postCount={gridPosts.length}
                                />
                            </div>

                            {/* COLUMN 3: MARKET TERMINAL (Data Sidebar) - 3/12 */}
                            <aside className="lg:col-span-4 xl:col-span-3 order-3 border-l border-gray-100 pl-6">
                                <div className="sticky top-40 space-y-10">
                                    <MarketSidebar />
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>

                {/* --- MOBILE VIEW (ENTERPRISE APP LAYOUT) --- */}
                <div className="md:hidden pb-20 pt-14">
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