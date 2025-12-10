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
    // Deterministically assigns your 4 designs based on position
    const determineVariant = (article, index, totalItems) => {
        // [IMAGE 3 DESIGN] Impact/Hero: Always the first story
        if (index === 0) return 'impact';

        // [DESIGN 4] Ranked List: The bottom half (Items 6-10)
        if (index >= 5) return 'ranked';

        // [IMAGE 2 DESIGN] Market Snap: Always Item #4 (Index 3)
        // This guarantees the "Vertical" visual break you requested
        if (index === 3 && article.imageUrl) {
            return 'market-snap';
        }

        // [OPINION DESIGN] Contextual: Triggers on specific keywords
        const title = article.title || "";
        const opinionKeywords = ["Why", "Opinion", "Outlook", "Forecast", "Analysis", "Review"];
        if (opinionKeywords.some(keyword => title.includes(keyword))) {
            return 'opinion';
        }

        // [IMAGE 1 DESIGN] Standard: The default for everything else (Items 2, 3, 5)
        return 'standard';
    };

    // --- SKELETON LOADER ---
    const renderSkeleton = () => (
        <div style={{ opacity: 0.6 }}>
            {/* Hero Skeleton (16:9) */}
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '90%', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '24px' }}></div>

            {/* Standard List Skeletons */}
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
                <span className="w-1 h-5 bg-red-600 mr-3"></span>
                Market Intelligence
            </h2>
            {renderSkeleton()}
        </div>
    );

    if (!news || news.length === 0) return null;

    return (
        <div className="w-full bg-white p-4">
            <h2 className="text-xl font-bold mb-6 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-red-600 mr-3"></span>
                Market Intelligence
            </h2>

            <div className="flex flex-col">
                {news.slice(0, 10).map((article, index) => {
                    const variant = determineVariant(article, index, 10);

                    // Add "Trending" divider before the Ranked List starts
                    const showTrendingHeader = index === 5;

                    return (
                        <React.Fragment key={article.id || index}>
                            {showTrendingHeader && (
                                <div className="mt-6 mb-3 pb-2 border-b border-black">
                                    <span className="text-xs font-bold uppercase tracking-wider text-red-600">Trending Now</span>
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