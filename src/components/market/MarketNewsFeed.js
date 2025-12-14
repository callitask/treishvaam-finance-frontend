import React, { useEffect, useState } from 'react';
import { getNewsHighlights } from '../../apiConfig';
import { Loader2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MarketNewsFeed = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await getNewsHighlights();
                // Phase 18: Handle Page object
                const articles = response.data.content || response.data || [];
                setNews(articles.slice(0, 10)); // Sidebar list
            } catch (error) {
                console.error("Failed to load market news", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
                Latest Wire
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {news.map((item) => (
                    <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                    >
                        <div className="flex gap-3">
                            {/* Tiny Thumbnail */}
                            <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-md overflow-hidden">
                                <img
                                    src={item.imageUrl || '/logo.webp'}
                                    alt=""
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => e.target.src = '/logo.webp'}
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-sky-600 transition-colors line-clamp-2">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded">
                                        {item.source ? item.source.toUpperCase().replace(/_/g, ' ') : 'NEWS'}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt)) : 'Recent'} ago
                                    </span>
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