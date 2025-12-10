import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './NewsCard.css'; // Ensure styles are loaded

const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com/api/v1';

const NewsIntelligenceWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Fetch fresh market highlights
        axios.get(`${API_URL}/market/news/highlights`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setNews(res.data);
                } else {
                    setNews([]);
                }
            })
            .catch(e => {
                console.error("News stream interrupted:", e);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, []);

    // --- SKELETON LOADER (Shimmer Effect) ---
    const renderSkeleton = () => (
        <div className="news-feed-container">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="news-item">
                    <div className="news-content">
                        <div className="skeleton sk-text" style={{ width: '20%' }}></div>
                        <div className="skeleton sk-headline"></div>
                        <div className="skeleton sk-headline" style={{ width: '60%' }}></div>
                        <div className="skeleton sk-meta"></div>
                    </div>
                    <div className="skeleton sk-thumb"></div>
                </div>
            ))}
        </div>
    );

    // --- SMART STREAM RENDERER ---
    const renderSmartStream = useMemo(() => {
        if (!news || news.length === 0) return null;

        // Slice to max 10 items for performance and layout balance
        const displayItems = news.slice(0, 10);

        return (
            <div className="news-feed-container">
                {displayItems.map((article, index) => {
                    // Logic: First 5 items get "Media Object" treatment (Visual)
                    // Next 5 items get "Ranked List" treatment (High Density)
                    const isTopStory = index < 5;
                    const variant = isTopStory ? 'media-object' : 'ranked-list';

                    return (
                        <NewsCard
                            key={article.id || index}
                            article={article}
                            variant={variant}
                            rank={index + 1}
                        />
                    );
                })}
            </div>
        );
    }, [news]);

    if (loading) return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-red-600 mr-3"></span>
                Market Intelligence
            </h2>
            {renderSkeleton()}
        </div>
    );

    if (error) return null;

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center font-serif text-gray-900">
                <span className="w-1 h-5 bg-red-600 mr-3"></span>
                Market Intelligence
            </h2>

            {renderSmartStream || (
                <div className="text-gray-400 text-sm p-8 text-center italic">
                    No market updates available at this moment.
                </div>
            )}
        </div>
    );
};

export default NewsIntelligenceWidget;