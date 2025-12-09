import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import './NewsCard.css';

const NewsIntelligenceWidget = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch from your backend endpoint
                const res = await axios.get('/api/market/news/highlights');
                setNews(res.data);
            } catch (err) {
                console.error("News fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // --- SMART ENTERPRISE LAYOUT ENGINE ---
    // Instead of random chaos, we use a weighted flow that mimics
    // professional editorial curation (Bloomberg/Reuters style).
    const renderNewsStream = useMemo(() => {
        return news.map((article, index) => {
            let variant = 'compact'; // Default for list

            // Rule 1: The very first item is the "Headline" (Hero/Impact)
            if (index === 0) {
                variant = 'impact';
            }
            // Rule 2: Items 1 and 2 are "Key Stories" (Focus Card)
            else if (index === 1 || index === 2) {
                variant = 'focus';
            }
            // Rule 3: Mix in a 'focus' card every 5 items to break visual monotony
            else if (index > 2 && index % 5 === 0) {
                variant = 'focus';
            }

            return <NewsCard key={article.id || index} article={article} variant={variant} />;
        });
    }, [news]);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>;

    return (
        <div className="news-widget-container">
            <h2 className="text-lg font-bold mb-4 text-gray-800 border-l-4 border-blue-600 pl-3">
                Market Intelligence
            </h2>
            <div className="news-stream">
                {renderNewsStream}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;