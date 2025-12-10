import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './NewsCard.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com/api/v1';

const NewsIntelligenceWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/market/news/highlights`)
            .then(res => {
                if (Array.isArray(res.data)) setNews(res.data);
                else setNews([]);
            })
            .catch(e => {
                console.error("News stream silent fail:", e);
                setNews([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // --- THE SMART LAYOUT ENGINE ---
    const determineVariant = (article, index, totalItems) => {
        // Rule 1: The Hero (Always the first item)
        if (index === 0) return 'impact';

        // Rule 2: The Trending List (The last 5 items)
        if (index >= 5) return 'ranked';

        // Rule 3: Market Snap (Always Item #4 to force rhythm)
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
            {/* Hero Skeleton */}
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '90%', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '24px' }}></div>

            {/* List Skeleton */}
            {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: '14px', width: '90%', marginBottom: '8px' }}></div>
                        <div className="skeleton" style={{ height: '14px', width: '60%' }}></div>
                    </div>
                    <div className="skeleton" style={{ width: '84px', height: '84px' }}></div>
                </div>
            ))}
        </div>
    );

    if (loading) return (
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
        <div className="w-full bg-white p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-blue-800 mr-3"></span>
                Market Intelligence
            </h2>

            <div className="flex flex-col">
                {news.slice(0, 10).map((article, index) => {
                    const variant = determineVariant(article, index, 10);
                    const showTrendingHeader = index === 5;

                    return (
                        <React.Fragment key={article.id || index}>
                            {showTrendingHeader && (
                                <div className="mt-6 mb-3 pb-2 border-b border-black">
                                    {/* COLOR UPDATE: Changed from text-red-600 to text-gray-900 (Black) */}
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900">Trending Now</span>
                                </div>
                            )}
                            <NewsCard
                                article={article}
                                variant={variant}
                                rank={index - 4}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;