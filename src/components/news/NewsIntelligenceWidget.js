import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './NewsCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com/api/v1';

/**
 * Enterprise News Widget (Smart Layout Edition)
 * - Intelligent Variant Allocation for "Load More"
 * - Maintains "Trending" list only for top 5-9 items
 */
const NewsIntelligenceWidget = ({ layoutMode = 'sidebar' }) => {
    const [news, setNews] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchNews = useCallback((pageNum, reset = false) => {
        const pageSize = 10; // Fetch 10 at a time
        const isLoadMore = pageNum > 0;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        axios.get(`${API_URL}/market/news/highlights?page=${pageNum}&size=${pageSize}`)
            .then(res => {
                const newArticles = Array.isArray(res.data) ? res.data : [];

                if (newArticles.length < pageSize) setHasMore(false);

                if (reset) {
                    setNews(newArticles);
                } else {
                    // Filter duplicates based on ID or Title before appending
                    setNews(prev => {
                        const existingIds = new Set(prev.map(n => n.id || n.title));
                        const uniqueNew = newArticles.filter(n => !existingIds.has(n.id || n.title));
                        return [...prev, ...uniqueNew];
                    });
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
    }, []);

    useEffect(() => {
        fetchNews(0, true);
    }, [fetchNews]);

    // --- SMART LAYOUT ENGINE ---
    const determineVariant = (article, index) => {
        // --- 1. INITIAL VIEW (Items 0-9) ---
        if (index === 0) return 'impact'; // The Main Hero
        if (index === 3 && article.imageUrl) return 'market-snap'; // Visual Break

        // The "Trending" List (Strictly items 5 to 9)
        // This keeps the sidebar tidy initially
        if (index >= 5 && index < 10) return 'ranked';

        // --- 2. EXTENDED FEED (Items 10+) ---
        // When user clicks "Load More", we switch to a FEED style (Cards)
        // instead of a LIST style, effectively "extending" the column visually.
        if (index >= 10) {
            // Every 5th item in the extended feed gets a Hero treatment
            if (index % 5 === 0 && article.imageUrl) return 'impact';

            // Check for Opinion pieces
            const title = article.title || "";
            const opinionKeywords = ["Why", "Opinion", "Outlook", "Forecast", "Analysis"];
            if (opinionKeywords.some(keyword => title.includes(keyword))) return 'opinion';

            // Default to Standard Card (Image + Text) for the rest
            // This consumes more vertical space, filling the "middle section" void.
            return 'standard';
        }

        // Standard checks for initial items 1-4
        const title = article.title || "";
        const opinionKeywords = ["Why", "Opinion", "Outlook", "Forecast", "Analysis"];
        if (opinionKeywords.some(keyword => title.includes(keyword))) return 'opinion';

        return 'standard';
    };

    if (loading && page === 0) return (
        <div className="w-full bg-white p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-blue-800 mr-3"></span>
                Market Intelligence
            </h2>
            <div className="animate-pulse space-y-4">
                <div className="h-48 bg-gray-200 w-full"></div>
                <div className="h-4 bg-gray-200 w-3/4"></div>
            </div>
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
                <button
                    onClick={() => fetchNews(0, true)}
                    className="text-gray-400 hover:text-blue-800 transition-colors text-sm"
                    title="Refresh Data"
                >
                    ⟳
                </button>
            </div>

            {/* Container */}
            <div className={layoutMode === 'newsroom' ? "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0" : "flex flex-col"}>

                {news.map((article, index) => {
                    const variant = determineVariant(article, index);

                    // Show "Trending Now" header ONLY before the ranked list starts (Index 5)
                    const showTrendingHeader = index === 5;

                    // Show "More Updates" header when the extended feed starts (Index 10)
                    const showExtendedHeader = index === 10;

                    const gridClass = (layoutMode === 'newsroom' && (index === 0 || variant === 'impact'))
                        ? "col-span-1 md:col-span-2"
                        : "col-span-1";

                    return (
                        <div key={article.id || index} className={gridClass}>
                            {/* Trending Header */}
                            {showTrendingHeader && (
                                <div className="mt-6 mb-3 pb-2 border-b border-black w-full">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Trending Now</span>
                                </div>
                            )}

                            {/* Extended Feed Header (Visual Break for Load More) */}
                            {showExtendedHeader && (
                                <div className="mt-8 mb-4 flex items-center">
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                    <span className="px-3 text-xs font-bold uppercase tracking-wider text-gray-500">Earlier Updates</span>
                                    <div className="h-px bg-gray-300 flex-1"></div>
                                </div>
                            )}

                            <NewsCard
                                article={article}
                                variant={variant}
                                rank={index - 4} // Rank only relevant for 5-9
                            />
                        </div>
                    );
                })}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <button
                        onClick={() => fetchNews(page + 1)}
                        disabled={loadingMore}
                        className="text-sm font-bold text-blue-800 hover:underline uppercase tracking-wide disabled:opacity-50"
                    >
                        {loadingMore ? 'Fetching...' : 'Load More News'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default NewsIntelligenceWidget;