"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from '../utils/react-router-shim';
import { getCategories, getPaginatedPosts } from '../apiConfig';
import { FiHome, FiTrendingUp, FiLayers, FiTarget, FiAlertCircle } from 'react-icons/fi';

// Desktop Components
import BlogGridDesktop from '../components/BlogPage/BlogGridDesktop';
import CategoryStrip from '../components/BlogPage/CategoryStrip';
import HeroSection from '../components/BlogPage/HeroSection';
import GlobalMarketTicker from '../components/market/GlobalMarketTicker';

// Utils
import { distributeContent } from '../utils/editorialDistributor';

// Lazy Load Mobile Tabs & Heavy Sidebars
const MarketSlideMobile = React.lazy(() => import('../components/BlogPage/MarketSlideMobile'));
const NewsTabMobile = React.lazy(() => import('../components/BlogPage/NewsTabMobile'));
const VisionPage = React.lazy(() => import('./VisionPage'));
const BlogSlideMobile = React.lazy(() => import('../components/BlogPage/BlogSlideMobile'));

// New Lazy Loaded Desktop Components
const FeaturedColumn = React.lazy(() => import('../components/BlogPage/FeaturedColumn'));
const MarketSidebar = React.lazy(() => import('../components/BlogPage/MarketSidebar'));

/**
 * [AI-OPTIMIZED CONTEXT]
 * Component: BlogPage
 * Purpose: The main landing page / feed of the application.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Changed sticky offsets. CategoryStrip now uses `top-[92px]` to stack perfectly under the Navbar.
 * - EDITED: Relocated GlobalMarketTicker directly beneath the CategoryStrip for perfect scroll-away behavior.
 * - EDITED: Removed Helmet.
 */

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
    const searchTerm = searchParams ? searchParams.get('q') : "";
    const [categoriesMap, setCategoriesMap] = useState({});
    const [isDataReady, setIsDataReady] = useState(false);

    const [activeTab, setActiveTab] = useState('home');

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

    const filteredPosts = useMemo(() => {
        let postsToFilter = posts;
        if (selectedCategory !== "All") { postsToFilter = postsToFilter.filter(p => p.category?.name === selectedCategory); }
        if (searchTerm) { const term = searchTerm.toLowerCase(); postsToFilter = postsToFilter.filter(p => p.title.toLowerCase().includes(term)); }
        return postsToFilter.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [posts, selectedCategory, searchTerm]);

    const { hero, mustRead, briefing, feed } = useMemo(() => {
        return distributeContent(filteredPosts);
    }, [filteredPosts]);

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

    if (page === 0 && loading && !isDataReady) return (
        <div className="text-center p-10 min-h-screen flex flex-col items-center justify-center text-gray-500">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-bold uppercase tracking-widest">Loading Treishvaam...</p>
        </div>
    );

    const MobileBottomNav = () => (
        <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-[90] flex justify-around items-center px-2 safe-pb transition-all duration-300">
            {[
                { id: 'home', label: 'Home', icon: FiHome },
                { id: 'markets', label: 'Markets', icon: FiTrendingUp },
                { id: 'briefs', label: 'News', icon: FiLayers },
                { id: 'vision', label: 'Vision', icon: FiTarget }
            ].map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => { setActiveTab(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform duration-100 group ${activeTab === id ? 'text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Icon size={20} className={`transition-all duration-300 ${activeTab === id ? 'fill-current scale-110 drop-shadow-sm' : ''}`} />
                    <span className="text-[10px] font-bold tracking-wide">{label}</span>
                    {activeTab === id && <span className="absolute bottom-1 w-1 h-1 bg-sky-700 rounded-full animate-in zoom-in"></span>}
                </button>
            ))}
        </nav>
    );

    return (
        <section className="bg-white min-h-screen font-sans -mx-4 sm:-mx-6 lg:-mx-8">
            <div className="hidden md:block">

                {/* 2. Category Strip stacks strictly at 92px below the native Navbar */}
                <div className="sticky top-[92px] z-30 bg-white border-b border-gray-200 shadow-sm transition-colors duration-300">
                    <CategoryStrip
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        loading={loadingCategories}
                    />
                </div>

                {/* 3. Global Ticker flows naturally below Category Strip. Scrolls up and disappears cleanly. */}
                <div className="w-full relative z-20">
                    <GlobalMarketTicker />
                </div>

                <div className="container mx-auto px-4 lg:px-6 pt-6 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <aside className="lg:col-span-3 order-1 border-r border-gray-100 pr-6 hidden xl:block">
                            <div className="sticky top-[160px] space-y-8">
                                <div className="border-b-2 border-black pb-2 mb-4">
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">The Briefing</h3>
                                </div>
                                <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded"></div>}>
                                    <FeaturedColumn />
                                </Suspense>
                            </div>
                        </aside>

                        <div className="lg:col-span-8 xl:col-span-6 order-2 px-0 lg:px-4">
                            <HeroSection featuredPost={hero} />
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-2 h-8 bg-sky-700"></span>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight font-serif">Latest Analysis</h2>
                            </div>
                            <BlogGridDesktop
                                mustReadPost={mustRead}
                                briefingPosts={briefing}
                                feedPosts={feed}
                                lastPostElementRef={lastPostElementRef}
                                onCategoryClick={setSelectedCategory}
                                categoriesMap={categoriesMap}
                                loading={loading}
                                page={page}
                                hasMore={hasMore}
                            />
                        </div>

                        <aside className="lg:col-span-4 xl:col-span-3 order-3 border-l border-gray-100 pl-6">
                            <div className="sticky top-[160px] space-y-10">
                                <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse rounded"></div>}>
                                    <MarketSidebar />
                                </Suspense>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            <div className="md:hidden pb-20 pt-2">
                <Suspense fallback={<div className="p-10 text-center"><div className="w-8 h-8 border-2 border-sky-600 rounded-full animate-spin mx-auto"></div></div>}>
                    {activeTab === 'home' && (
                        <BlogSlideMobile
                            heroPost={hero}
                            mustReadPost={mustRead}
                            briefingPosts={briefing}
                            feedPosts={feed}
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
                    {activeTab === 'markets' && <div className="animate-in fade-in duration-200"><MarketSlideMobile /></div>}
                    {activeTab === 'briefs' && <div className="animate-in fade-in duration-200"><NewsTabMobile /></div>}
                    {activeTab === 'vision' && <div className="animate-in fade-in duration-200"><VisionPage /></div>}
                </Suspense>
                <MobileBottomNav />
            </div>
        </section>
    );
};

export default BlogPage;