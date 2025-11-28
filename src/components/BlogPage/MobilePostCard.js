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

    // --- CINEMATIC HERO (Vertical 4:5 Poster Style) ---
    if (isHero) {
        return (
            <div ref={ref} className="relative w-full aspect-[4/5] overflow-hidden bg-gray-900 group">
                <Link to={postLink} aria-label={article.title} className="block w-full h-full">
                    {thumbnail ? (
                        <ResponsiveAuthImage
                            baseName={thumbnail.imageUrl}
                            alt={thumbnail.altText || article.title}
                            className="w-full h-full object-cover opacity-90"
                            eager={true}
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                            <span className="text-slate-500 font-serif text-2xl">Treishvaam</span>
                        </div>
                    )}
                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-3">
                            <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-sm">
                                {categoryName}
                            </span>
                            {isNew && <span className="text-[10px] font-bold text-red-400 animate-pulse">• LIVE</span>}
                        </div>

                        <h2 className="text-3xl font-black text-white font-serif leading-tight mb-3 drop-shadow-lg line-clamp-3">
                            {article.title}
                        </h2>

                        <div className="flex items-center justify-between text-gray-300 text-xs font-medium border-t border-white/20 pt-3 mt-1">
                            <span>{displayDate}</span>
                            <span className="flex items-center gap-1"><FaClock size={10} /> 5 min read</span>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // --- STANDARD LIST CARD (Compact) ---
    return (
        <div ref={ref} className="p-4 flex gap-4 items-start active:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            <div className="flex-1 flex flex-col justify-between h-full min-h-[5.5rem]">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="text-[9px] font-bold uppercase tracking-widest text-sky-700">
                            {categoryName}
                        </span>
                        {isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                    </div>
                    <Link to={postLink}>
                        <h3 className="text-[15px] font-bold text-gray-900 font-serif leading-snug line-clamp-3 mb-1">
                            {article.title}
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">{displayDate}</span>
                </div>
            </div>

            {thumbnail && (
                <Link to={postLink} className="w-[100px] h-[75px] flex-shrink-0 rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover"
                        eager={eager}
                    />
                </Link>
            )}
        </div>
    );
}));

export default MobilePostCard;