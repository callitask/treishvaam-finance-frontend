import React, { memo, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { formatDateTime } from '../../utils/blogUtils';
import { FaRegBookmark } from 'react-icons/fa';

const MobilePostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap, eager = false, isHero = false }, ref) => {
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'News';
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const thumbnail = article.thumbnails && article.thumbnails.length > 0 ? article.thumbnails[0] : null;

    if (isHero) {
        return (
            <div ref={ref} className="bg-white pb-0 shadow-sm relative group">
                <Link to={postLink} aria-label={article.title} className="block relative aspect-[16/9] overflow-hidden">
                    {thumbnail ? (
                        <ResponsiveAuthImage
                            baseName={thumbnail.imageUrl}
                            alt={thumbnail.altText || article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            eager={true}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="inline-block px-2 py-0.5 bg-sky-600 text-white text-[10px] font-bold uppercase tracking-wider mb-2 rounded-sm shadow-sm">
                            {categoryName}
                        </span>
                        <h2 className="text-2xl font-bold text-white font-serif leading-tight mb-2 drop-shadow-md">
                            {article.title}
                        </h2>
                        <div className="flex justify-between items-center text-gray-300 text-[11px] font-medium">
                            <div className="flex items-center gap-2">
                                <span>{displayDate}</span>
                                {isNew && <span className="text-red-400 font-bold">• NEW</span>}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // Standard List Card (High density)
    return (
        <div ref={ref} className="p-4 flex gap-4 items-start active:bg-gray-50 transition-colors">
            <div className="flex-1 flex flex-col justify-between h-full min-h-[5.5rem]">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                            {categoryName}
                        </span>
                        {isNew && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 rounded">NEW</span>}
                    </div>
                    <Link to={postLink}>
                        <h3 className="text-[15px] font-bold text-gray-900 font-serif leading-snug line-clamp-3 mb-1">
                            {article.title}
                        </h3>
                    </Link>
                </div>
                <div className="flex items-center justify-between mt-auto pt-1">
                    <span className="text-[10px] text-gray-400 font-medium">{displayDate}</span>
                    <button className="text-gray-300 hover:text-sky-600 p-1 -mr-2"><FaRegBookmark size={14} /></button>
                </div>
            </div>

            {thumbnail && (
                <Link to={postLink} className="w-[35%] aspect-[4/3] flex-shrink-0 rounded-md overflow-hidden bg-gray-100 relative shadow-sm">
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