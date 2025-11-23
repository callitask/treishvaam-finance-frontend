import React, { useState, useEffect } from 'react';
import { getNewsHighlights } from '../../apiConfig';
import { ExternalLink } from 'lucide-react';

// Helper to format time ago
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const MarketNewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const response = await getNewsHighlights();
                setNews(response.data);
            } catch (e) {
                console.error("Failed to fetch news highlights:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) {
        return <div className="p-4 rounded-lg bg-gray-50 animate-pulse h-64"></div>;
    }

    if (news.length === 0) {
        return (
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Market news</h2>
                <p className="text-gray-500 text-sm">No news highlights available at this time.</p>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Market news</h2>
            <div className="space-y-4">
                {news.map((article) => (
                    <a
                        key={article.articleId}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        aria-label={`Read full story: ${article.title}`} // FIXED: Added specific label
                    >
                        <div className="flex">
                            {article.imageUrl && (
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-24 h-24 object-cover rounded-md mr-4"
                                />
                            )}
                            <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-500 uppercase">
                                    {article.source} · {timeAgo(article.publishedAt)}
                                </div>
                                <h3 className="text-md font-semibold text-gray-800 my-1 line-clamp-2">
                                    {article.title}
                                </h3>
                                <div className="text-sm text-blue-600 inline-flex items-center">
                                    Read More <ExternalLink size={14} className="ml-1" />
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default MarketNewsFeed;