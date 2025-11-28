import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { categoryStyles, formatDateTime } from '../../utils/blogUtils';

const FeedGridCard = ({ article, onCategoryClick, categoriesMap }) => {
    const { displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;
    const thumbnail = article.thumbnails?.[0] || {};

    return (
        <div className="group flex flex-col h-full bg-white border-b border-gray-100 pb-6 mb-6 last:border-0">
            {/* Image Top */}
            <Link to={postLink} className="block w-full aspect-video overflow-hidden rounded-sm bg-gray-100 mb-3 relative">
                {thumbnail.imageUrl && (
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={400}
                    />
                )}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                    {categoryName}
                </div>
            </Link>

            <div className="flex flex-col flex-grow">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {displayDate}
                </div>

                <Link to={postLink} className="group-hover:text-sky-700 transition-colors">
                    <h3 className="text-base font-bold text-gray-900 font-serif leading-tight mb-2 line-clamp-3">
                        {article.title}
                    </h3>
                </Link>
            </div>
        </div>
    );
};

export default FeedGridCard;