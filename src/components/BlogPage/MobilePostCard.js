import React, { memo, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { formatDateTime } from '../../utils/blogUtils';
import { FaClock } from 'react-icons/fa';

const MobilePostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap, eager = false, isHero = false }, ref) => {
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'News';
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const thumbnail = article.thumbnails && article.thumbnails.length > 0 ? article.thumbnails[0] : null;

    // --- VIEW 1: HERO CARD (Cinematic 16:9) ---
    // Reduced height to avoid taking up the whole screen
    if (isHero) {
        return (
            <div ref={ref} className="relative w-full aspect-video overflow-hidden bg-gray-900 group shadow-md mb-2">
                <Link to={postLink} aria-label={article.title} className="block w-full h-full relative">
                    {thumbnail ? (
                        <ResponsiveAuthImage
                            baseName={thumbnail.imageUrl}
                            alt={thumbnail.altText || article.title}
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 ease-in-out group-active:scale-105"
                            eager={true} // Priority loading
                            width={600}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-500 font-serif text-xl tracking-widest opacity-20 font-black uppercase">Treishvaam</span>
                        </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Text Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="inline-block px-2 py-0.5 bg-sky-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-sm border border-white/10">
                                {categoryName}
                            </span>
                            {isNew && <span className="text-[9px] font-bold text-red-400 animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> LIVE</span>}
                        </div>

                        <h2 className="text-lg font-black text-white font-serif leading-tight mb-2 drop-shadow-md line-clamp-2">
                            {article.title}
                        </h2>

                        <div className="flex items-center justify-between text-gray-300 text-[10px] font-medium border-t border-white/20 pt-2 mt-1 font-sans">
                            <span>{displayDate}</span>
                            <span className="flex items-center gap-1"><FaClock size={10} /> Read</span>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // --- VIEW 2: COMPACT LIST CARD ---
    return (
        <div ref={ref} className="p-4 flex gap-4 items-start active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 bg-white">
            <div className="flex-1 flex flex-col h-full min-h-[5rem]">
                <div className="mb-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
                            {categoryName}
                        </span>
                        {isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    </div>
                    <Link to={postLink}>
                        <h3 className="text-[15px] font-bold text-gray-900 font-serif leading-[1.35] line-clamp-3 mb-1">
                            {article.title}
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 font-medium font-sans">{displayDate}</span>
                </div>
            </div>

            {thumbnail && (
                <Link to={postLink} className="w-[90px] h-[65px] flex-shrink-0 rounded bg-gray-100 shadow-sm border border-gray-100 overflow-hidden relative">
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover"
                        eager={eager}
                        width={200}
                    />
                </Link>
            )}
        </div>
    );
}));

export default MobilePostCard;