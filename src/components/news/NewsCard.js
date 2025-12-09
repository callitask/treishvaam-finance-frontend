import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';

// Helper to extract domain for favicon
const getDomain = (url) => {
    try {
        if (!url) return 'news';
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    } catch (e) {
        return 'news';
    }
};

// Helper for relative time
const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};

const NewsCard = ({ article, variant }) => {
    if (!article) return null;

    const domain = getDomain(article.link);
    // Using Google's favicon service for reliable enterprise logos
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const timeDisplay = timeAgo(article.publishedAt);

    // VARIANT: FEATURED (Lead Story)
    if (variant === 'featured') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-sky-500 hover:shadow-md transition-all duration-300 mb-3"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-600 group-hover:w-1.5 transition-all"></div>

                <div className="p-4 pl-5">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <img
                                src={faviconUrl}
                                alt={article.source || domain}
                                className="w-5 h-5 rounded-sm opacity-80"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                                {article.source || domain}
                            </span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock size={10} /> {timeDisplay}
                        </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 leading-snug font-serif group-hover:text-sky-700 transition-colors mb-2">
                        {article.title}
                    </h3>

                    <div className="flex items-center text-xs text-gray-400 font-medium group-hover:text-sky-600 transition-colors">
                        Read Full Story <ExternalLink size={12} className="ml-1" />
                    </div>
                </div>
            </a>
        );
    }

    // VARIANT: COMPACT (Standard List)
    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
        >
            <div className="shrink-0 mt-1">
                <img
                    src={faviconUrl}
                    alt=""
                    className="w-4 h-4 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity"
                    onError={(e) => e.target.style.display = 'none'}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-gray-700 group-hover:text-sky-700 leading-snug mb-1 line-clamp-2">
                    {article.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="font-medium text-gray-500">
                        {article.source ? article.source.replace(/_/g, ' ') : domain}
                    </span>
                    <span>•</span>
                    <span>{timeDisplay} ago</span>
                </div>
            </div>
        </a>
    );
};

export default NewsCard;