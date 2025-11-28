import React, { memo, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

const GridPostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap }, ref) => {
    const { isNew } = formatDateTime(article.updatedAt || article.createdAt);
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(article.updatedAt || article.createdAt));
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const thumbnail = article.thumbnails && article.thumbnails.length > 0 ? article.thumbnails[0] : null;

    return (
        <div ref={ref} className="flex flex-col h-full bg-white border-b border-gray-100 pb-4 mb-4 last:mb-0 last:pb-0 last:border-0 group">

            {/* THUMBNAIL (16:9 for Grid to save vertical space) */}
            {thumbnail && (
                <Link to={postLink} className="block aspect-video mb-3 overflow-hidden rounded-sm bg-gray-100">
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        width={300}
                    />
                </Link>
            )}

            <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                    <button
                        onClick={() => onCategoryClick(categoryName)}
                        className={`text-[10px] font-bold uppercase tracking-widest ${categoryClass} hover:underline`}
                    >
                        {categoryName}
                    </button>
                    {isNew && <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                </div>

                <h3 className="text-lg font-bold text-gray-900 font-serif leading-tight mb-2 group-hover:text-sky-700 transition-colors">
                    <Link to={postLink}>{article.title}</Link>
                </h3>

                <p className="text-xs text-gray-500 font-medium mb-1">
                    {displayDate}
                </p>

                <p className="text-sm text-gray-600 line-clamp-3 font-serif leading-relaxed">
                    {createSnippet(article.customSnippet || article.content, 80)}
                </p>
            </div>
        </div>
    );
}));

export default GridPostCard;