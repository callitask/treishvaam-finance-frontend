import React from 'react';
import { ExternalLink, Clock, Zap, ChevronRight, TrendingUp } from 'lucide-react';

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

    if (seconds < 60) return 'Now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
};

const NewsCard = ({ article, variant = 'ticker' }) => {
    if (!article) return null;

    const domain = getDomain(article.link);
    const sourceName = article.source || domain;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const timeDisplay = timeAgo(article.publishedAt);

    // --- TIER 1: HERO (The Lead Story - Index 0) ---
    // Immersive, full-width, dark overlay.
    if (variant === 'hero') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-slate-900 mb-8 shadow-sm hover:shadow-xl transition-all duration-500"
            >
                {/* Background Image */}
                {article.imageUrl ? (
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                        <img src={faviconUrl} alt="" className="w-16 h-16 opacity-10 grayscale invert" />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                            <Zap size={10} className="fill-current" /> Lead
                        </span>
                    </div>

                    <h3 className="text-xl font-black leading-tight text-white font-serif drop-shadow-md line-clamp-4 mb-3 group-hover:text-sky-200 transition-colors">
                        {article.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wide border-t border-white/20 pt-3">
                        <img src={faviconUrl} alt="" className="w-4 h-4 rounded-sm bg-white p-0.5" />
                        <span>{sourceName}</span>
                        <span className="text-gray-500 mx-1">•</span>
                        <span className="text-gray-400">{timeDisplay}</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- TIER 2: FOCUS (Editorial Highlight - Index 1-2) ---
    // Large Card, Image Top, Headline Bottom.
    if (variant === 'focus') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group mb-8"
            >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                    {article.imageUrl ? (
                        <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <img src={faviconUrl} alt="" className="w-8 h-8 opacity-20 grayscale" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1.5">
                    <span>{sourceName}</span>
                </div>

                <h3 className="text-base font-bold text-gray-900 leading-snug font-serif group-hover:text-sky-700 transition-colors line-clamp-3">
                    {article.title}
                </h3>
            </a>
        );
    }

    // --- TIER 3: STANDARD (Key Stories - Index 3-5) ---
    // Row Layout: Image Left, Text Right.
    if (variant === 'standard') {
        return (
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 mb-6 items-start"
            >
                <div className="shrink-0 relative w-[70px] h-[70px] rounded-lg overflow-hidden bg-gray-100">
                    {article.imageUrl ? (
                        <img
                            src={article.imageUrl}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-50">
                            <img src={faviconUrl} alt="" className="w-5 h-5 opacity-40 grayscale" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 font-serif group-hover:text-sky-700 transition-colors mb-1.5">
                        {article.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        <span>{sourceName}</span>
                        <span>•</span>
                        <span>{timeDisplay}</span>
                    </div>
                </div>
            </a>
        );
    }

    // --- TIER 4: TICKER (The Wire - Index 6+) ---
    // Minimal, Text Only.
    return (
        <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block py-3 border-b border-dotted border-gray-200 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded transition-colors"
        >
            <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-1.5">
                    <img src={faviconUrl} alt="" className="w-3 h-3 rounded-full opacity-60" onError={(e) => e.target.style.display = 'none'} />
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">{sourceName}</span>
                </div>
                <span className="text-[9px] font-mono text-gray-400">{timeDisplay}</span>
            </div>

            <h5 className="text-xs font-medium text-gray-700 leading-snug group-hover:text-gray-900 line-clamp-2">
                {article.title}
            </h5>
        </a>
    );
};

export default NewsCard;