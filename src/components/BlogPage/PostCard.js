import React, { memo, forwardRef, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import Slider from "react-slick";
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

/**
 * AI-CONTEXT:
 * Purpose: Reusable card for blog post feed.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Changed title heading from H3 to H2 to fix Accessibility hierarchy (H1 -> H2)
 */

const PostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew } = formatDateTime(article.updatedAt || article.createdAt);
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(new Date(article.updatedAt || article.createdAt));
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];

    // Carousel Settings for Story Posts
    const landscapeSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, arrows: false, customPaging: () => <div className="w-1.5 h-1.5 bg-white/50 rounded-full mt-1"></div> };

    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const ThumbnailDisplay = () => {
        if (!hasThumbnails) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No Image</div>;

        if (isStory) {
            return (
                <div className="w-full h-full bg-gray-100 group overflow-hidden">
                    <Slider ref={sliderRef} {...landscapeSettings}>
                        {article.thumbnails.map(thumb => (
                            <div key={thumb.id} className="relative aspect-[4/3]">
                                <Link to={postLink} aria-label={`View story: ${article.title}`}>
                                    <ResponsiveAuthImage
                                        baseName={thumb.imageUrl}
                                        alt={thumb.altText || article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        width={400}
                                        height={300}
                                    />
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            );
        }
        return (
            <Link to={postLink} className="block w-full h-full bg-gray-100 group overflow-hidden" aria-label={`Read ${article.title}`}>
                <ResponsiveAuthImage
                    baseName={article.thumbnails[0].imageUrl}
                    alt={article.thumbnails[0].altText || article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={400}
                    height={300}
                />
            </Link>
        );
    };

    return (
        <div ref={ref} className="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-200 last:border-0 group">

            {/* THUMBNAIL (Standard 4:3 Aspect Ratio) */}
            <div className="w-full md:w-1/3 shrink-0">
                <div className="aspect-[4/3] rounded-sm overflow-hidden border border-gray-100">
                    <ThumbnailDisplay />
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2 text-xs">
                    <button onClick={() => onCategoryClick(categoryName)} className={`font-bold uppercase tracking-widest ${categoryClass} hover:underline`}>
                        {categoryName}
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 font-medium uppercase tracking-wide">{displayDate}</span>
                    {isNew && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-auto md:ml-0">NEW</span>}
                </div>

                {/* ACCESSIBILITY: Changed H3 to H2 for correct hierarchy */}
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif leading-snug mb-3 group-hover:text-sky-700 transition-colors">
                    <Link to={postLink}>{article.title}</Link>
                </h2>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 mb-4 font-serif">
                    {createSnippet(article.customSnippet || article.content, 160)}
                </p>

                <div className="mt-auto pt-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        By Treishvaam Finance
                    </span>
                </div>
            </div>
        </div>
    );
}));

export default PostCard;