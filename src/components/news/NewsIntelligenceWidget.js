import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './NewsCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com/api/v1';

/**
 * Enterprise News Widget (Logic Upgrade)
 * Connects to the Backend Intelligence Engine while preserving original visuals.
 * * @param {string} layoutMode - 'sidebar' (Default) or 'newsroom' (For middle column usage)
 */
const NewsIntelligenceWidget = ({ layoutMode = 'sidebar' }) => {
    const [news, setNews] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // --- 1. SMART FETCH ENGINE ---
    const fetchNews = useCallback((pageNum, reset = false) => {
        // Fetch more items in 'newsroom' mode to fill the grid
        const pageSize = layoutMode === 'newsroom' ? 14 : 10;
        const isLoadMore = pageNum > 0;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        axios.get(`${API_URL}/market/news/highlights?page=${pageNum}&size=${pageSize}`)
            .then(res => {
                const newArticles = Array.isArray(res.data) ? res.data : [];

                // Intelligence Check: If backend returns less than requested, we reached the end
                if (newArticles.length < pageSize) setHasMore(false);

                if (reset) {
                    setNews(newArticles);
                } else {
                    setNews(prev => [...prev, ...newArticles]);
                }
                setPage(pageNum);
            })
            .catch(e => {
                console.error("News stream silent fail:", e);
                if (reset) setNews([]);
            })
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    }, [layoutMode]);

    // Initial Load
    useEffect(() => {
        fetchNews(0, true);
    }, [fetchNews]);

    // --- 2. THE VARIANT ENGINE (Preserved) ---
    // This logic ensures your specific design variations appear in the perfect rhythm
    const determineVariant = (article, index) => {
        // Rule 1: The Hero (Always the first item)
        if (index === 0) return 'impact';

        // Rule 2: The Trending List (Items after #5)
        if (index >= 5) return 'ranked';

        // Rule 3: Market Snap (Item #4, if image exists)
        if (index === 3 && article.imageUrl) {
            return 'market-snap';
        }

        const title = article.title || "";

        // Rule 4: Opinion/Analysis (Keywords in title)
        const opinionKeywords = ["Why", "Opinion", "Outlook", "Forecast", "Analysis", "Review"];
        if (opinionKeywords.some(keyword => title.includes(keyword))) {
            return 'opinion';
        }

        // Rule 5: Standard (The default fallback)
        return 'standard';
    };

    // --- SKELETON LOADER ---
    const renderSkeleton = () => (
        <div style={{ opacity: 0.6 }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', marginBottom: '12px', background: '#e5e7eb' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '90%', marginBottom: '8px', background: '#e5e7eb' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '24px', background: '#e5e7eb' }}></div>
            {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px', background: '#e5e7eb' }}></div>
                        <div className="skeleton" style={{ height: '14px', width: '60%', background: '#e5e7eb' }}></div>
                    </div>
                    <div className="skeleton" style={{ width: '84px', height: '84px', background: '#e5e7eb' }}></div>
                </div>
            ))}
        </div>
    );

    if (loading && page === 0) return (
        <div className="w-full bg-white p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-blue-800 mr-3"></span>
                Market Intelligence
            </h2>
            {renderSkeleton()}
        </div>
    );

    if (!news || news.length === 0) return null;

    return (
        <div className={`w-full bg-white p-4 ${layoutMode === 'newsroom' ? 'border rounded-lg shadow-sm my-8' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center font-serif text-gray-900">
                    <span className="w-1 h-5 bg-blue-800 mr-3"></span>
                    {layoutMode === 'newsroom' ? 'Global Market Intelligence' : 'Market Intelligence'}
                </h2>
                {/* Refresh Button */}
                <button
                    onClick={() => fetchNews(0, true)}
                    className="text-gray-400 hover:text-blue-800 transition-colors text-sm"
                    title="Refresh Data"
                >
                    ⟳
                </button>
            </div>

            {/* --- 3. ADAPTIVE CONTAINER --- */}
            {/* Sidebar Mode = Column. Newsroom Mode = 2-Column Grid. */}
            <div className={
                layoutMode === 'newsroom'
                    ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0"
                    : "flex flex-col"
            }>
                {news.map((article, index) => {
                    const variant = determineVariant(article, index);
                    const showTrendingHeader = index === 5;

                    // Smart Spanning: In grid mode, the Hero (index 0) takes full width
                    const gridClass = (layoutMode === 'newsroom' && index === 0)
                        ? "col-span-1 md:col-span-2"
                        : "col-span-1";

                    return (
                        <div key={article.id || index} className={gridClass}>
                            {showTrendingHeader && (
                                <div className="mt-6 mb-3 pb-2 border-b border-black w-full">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Trending Now</span>
                                </div>
                            )}
                            <NewsCard
                                article={article}
                                variant={variant}
                                rank={index - 4}
                            />
                        </div>
                    );
                })}
            </div>

            {/* --- 4. LOAD MORE --- */}
            {hasMore && (
                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <button
                        onClick={() => fetchNews(page + 1)}
                        disabled={loadingMore}
                        className="text-sm font-bold text-blue-800 hover:underline uppercase tracking-wide disabled:opacity-50"
                    >
                        {loadingMore ? 'Loading Intelligence...' : 'Load More News'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsIntelligenceWidget;