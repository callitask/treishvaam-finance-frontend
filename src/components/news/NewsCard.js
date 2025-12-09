import React from 'react';
import { ExternalLink, Clock, Zap, ChevronRight } from 'lucide-react';

// Helper to extract domain for favicon/source label
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

const NewsCard = ({ article, variant = 'brief' }) => {
    if (!article) return null;

    const domain = getDomain(article.link);
    const sourceName = article.source || domain;
    // Enterprise fallback: Use Google's favicon service if no image is present
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const timeDisplay = timeAgo(article.publishedAt);

    // --- DESIGN A: HERO (The Lead Story) ---
    // High impact, background image, gradient text
    if (variant === 'hero') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-slate-900 shadow-md mb-6"
            >
                {/* Background Image */}
                {article.imageUrl ? (
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    />
                ) : (
                    // Fallback abstract pattern if no image
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center opacity-50">
                        <img src={faviconUrl} alt="" className="w-16 h-16 opacity-20 grayscale" />
                    </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

                {/* Content Layer */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
                            <Zap size={10} className="fill-current" /> Lead Story
                        </span>
                        <span className="text-[10px] font-medium text-gray-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                            <Clock size={10} /> {timeDisplay}
                        </span>
                    </div>

                    <h3 className="text-lg font-black leading-tight text-white font-serif drop-shadow-sm line-clamp-3 mb-2 group-hover:text-sky-200 transition-colors">
                        {article.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wide">
                        <div className="flex items-center gap-1 text-sky-400">
                            Read <ExternalLink size={10} />
                        </div>
                        <span>•</span>
                        {/* Source Logo (Small) */}
                        <img src={faviconUrl} alt="" className="w-4 h-4 rounded-sm bg-white p-0.5" onError={(e) => e.target.style.display = 'none'} />
                        {sourceName}
                    </div>
                </div>
            </a>
        );
    }

    // --- DESIGN B: STANDARD (Key Stories) ---
    // Row layout: Thumbnail (Left) + Text (Right)
    if (variant === 'standard') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 py-4 border-b border-dashed border-gray-200 hover:bg-gray-50/50 transition-colors"
            >
                {/* Thumbnail Column */}
                <div className="shrink-0 relative w-[85px] h-[65px] rounded-lg overflow-hidden border border-gray-100 bg-gray-100">
                    {article.imageUrl ? (
                        <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <img src={faviconUrl} alt="" className="w-6 h-6 opacity-40 grayscale" />
                        </div>
                    )}
                </div>

                {/* Text Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 font-serif group-hover:text-sky-700 transition-colors">
                        {article.title}
                    </h4>

                    <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                            <img src={faviconUrl} alt="" className="w-3 h-3 rounded-full grayscale opacity-70" onError={(e) => e.target.style.display = 'none'} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{sourceName}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{timeDisplay}</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- DESIGN C: BRIEF (The Wire) ---
    // Ultra-compact text only. Best for list density.
    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block py-2.5 px-3 border-l-2 border-transparent hover:border-sky-500 hover:bg-slate-50 transition-all"
        >
            <div className="flex items-baseline justify-between gap-4 mb-0.5">
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider truncate max-w-[100px]">
                    {sourceName}
                </span>
                <span className="text-[9px] font-mono text-gray-400 shrink-0">
                    {timeDisplay}
                </span>
            </div>

            <div className="flex items-start gap-2">
                <h5 className="text-xs font-medium text-gray-700 leading-snug group-hover:text-gray-900 line-clamp-2">
                    {article.title}
                </h5>
                <ChevronRight size={12} className="text-gray-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
            </div>
        </a>
    );
};

export default NewsCard;