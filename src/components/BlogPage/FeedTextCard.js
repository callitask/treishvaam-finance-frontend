import React from 'react';
import { Link } from 'react-router-dom';
import { categoryStyles, formatDateTime } from '../../utils/blogUtils';

const FeedTextCard = ({ article, onCategoryClick, categoriesMap }) => {
    const { displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'News';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    return (
        <div className="flex flex-col h-full bg-gray-50 p-4 rounded-sm border border-gray-100 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all group">
            <div className="mb-2">
                <button
                    onClick={() => onCategoryClick(categoryName)}
                    className={`text-[9px] font-black uppercase tracking-widest ${categoryClass}`}
                >
                    {categoryName}
                </button>
            </div>

            <Link to={postLink} className="block mb-2 flex-grow">
                <h4 className="text-sm font-bold text-gray-900 font-serif leading-snug group-hover:text-sky-700 line-clamp-3">
                    {article.title}
                </h4>
            </Link>

            <div className="pt-2 border-t border-gray-100 mt-auto">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                    {displayDate}
                </span>
            </div>
        </div>
    );
};

export default FeedTextCard;