import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';

const NewsIntelligenceWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/market/news/highlights')
            .then(res => setNews(res.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const renderSmartStream = useMemo(() => {
        return news.map((article, index) => {
            let variant = 'standard'; // Fallback

            // PATTERN LOGIC:
            // 1. Headline is ALWAYS Impact
            if (index === 0) variant = 'impact';

            // 2. Index 1 & 2 are either MarketSnap or Standard
            else if (index === 1) variant = 'marketsnap';

            // 3. Every 4th item (index 3, 7, 11) is an Opinion block to break the eye
            else if (index % 4 === 3) variant = 'opinion';

            // 4. If title is very short (< 50 chars), use Compact ticker style
            else if (article.title.length < 50) variant = 'compact';

            // 5. Random Injection for variety (15% chance of MarketSnap on normal rows)
            else if (Math.random() > 0.85) variant = 'marketsnap';

            return <NewsCard key={article.id || index} article={article} variant={variant} />;
        });
    }, [news]);

    if (loading) return <div>Loading Intelligence...</div>;

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="w-2 h-6 bg-blue-600 mr-2 rounded-sm"></span>
                Market Intelligence
            </h2>
            <div className="flex flex-col gap-1">
                {renderSmartStream}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;