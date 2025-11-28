import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { FaRegBookmark, FaShareAlt, FaClock } from 'react-icons/fa';
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

const FeedRowCard = ({ article, onCategoryClick, categoriesMap }) => {
    const { displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    // Calculate pseudo reading time based on content length
    const readingTime = Math.ceil((article.content?.length || 0) / 1000) + ' min read';
    const thumbnail = article.thumbnails?.[0] || {};

    return (
        <div className="group relative flex flex-col md:flex-row gap-6 py-8 border-b border-gray-100 last:border-0 items-start hover:bg-gray-50/50 transition-colors -mx-4 px-4 rounded-lg">

            {/* THUMBNAIL */}
            <Link to={postLink} className="block w-full md:w-[260px] shrink-0 aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 relative shadow-sm">
                {thumbnail.imageUrl ? (
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={400}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs bg-slate-50">No Image</div>
                )}
            </Link>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col h-full">

                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold">
                        <button onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className={`${categoryClass} hover:underline`}>
                            {categoryName}
                        </button>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-400">{displayDate}</span>
                    </div>
                    {/* Hover Actions */}
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                        <button className="hover:text-sky-600" title="Save"><FaRegBookmark /></button>
                        <button className="hover:text-sky-600" title="Share"><FaShareAlt /></button>
                    </div>
                </div>

                <Link to={postLink} className="group-hover:text-sky-700 transition-colors block mb-3">
                    <h3 className="text-xl font-black text-gray-900 font-serif leading-tight">
                        {article.title}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm leading-7 font-serif line-clamp-2 md:line-clamp-3 mb-4 flex-grow">
                    {createSnippet(article.customSnippet || article.content, 200)}
                </p>

                {/* Footer / Author */}
                <div className="mt-auto pt-2 flex items-center gap-2 border-t border-dotted border-gray-200 w-full">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">TF</div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Treishvaam Analyst</span>
                    <span className="text-gray-300 mx-1">•</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <FaClock size={10} /> {readingTime}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FeedRowCard;