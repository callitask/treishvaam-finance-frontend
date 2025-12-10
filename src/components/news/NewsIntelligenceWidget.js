import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';

// FIXED: Point directly to the Production Backend
const API_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com/api/v1';

const NewsIntelligenceWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // FIXED: Use absolute URL to avoid hitting the Frontend server
        axios.get(`${API_URL}/market/news/highlights`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setNews(res.data);
                } else {
                    console.warn("News API returned unexpected format:", res.data);
                    setNews([]);
                }
            })
            .catch(e => {
                console.error("News fetch failed:", e);
                setError(true);
                setNews([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const renderSmartStream = useMemo(() => {
        if (!news || !Array.isArray(news) || news.length === 0) return null;

        return news.map((article, index) => {
            let variant = 'standard';

            // PATTERN LOGIC:
            if (index === 0) variant = 'impact';
            else if (index === 1) variant = 'marketsnap';
            else if (index % 4 === 3) variant = 'opinion';
            else if (article && article.title && article.title.length < 50) variant = 'compact';
            else if (Math.random() > 0.85) variant = 'marketsnap';

            return <NewsCard key={article.id || index} article={article} variant={variant} />;
        });
    }, [news]);

    if (loading) return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[200px] flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading Intelligence...</span>
        </div>
    );

    if (error) return null;

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-600 mr-2 rounded-sm"></span>
                Market Intelligence
            </h2>
            <div className="flex flex-col gap-1">
                {renderSmartStream || <div className="text-gray-400 text-sm p-4 text-center">No news available</div>}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;