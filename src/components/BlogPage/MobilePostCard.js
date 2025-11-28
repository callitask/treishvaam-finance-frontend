import React, { memo, forwardRef, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import Slider from "react-slick";
import { categoryStyles, formatDateTime } from '../../utils/blogUtils';

const MobilePostCard = memo(forwardRef(({ article, onCategoryClick, layout, categoriesMap, eager = false }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const isFeatured = article.featured;
    const isBannerLayout = layout === 'banner';
    const titleClass = "text-sm font-bold text-gray-900 leading-tight";
    const sliderSettings = { dots: false, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3500, arrows: false };

    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    return (
        <div ref={ref} className={`bg-white shadow-sm flex flex-col relative ${isBannerLayout ? 'col-span-2' : 'col-span-1'}`}>
            {isFeatured && (
                <div className="absolute top-2 left-2 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-2 py-1 shadow-md uppercase tracking-wider">Featured</span>
                </div>
            )}

            {/* THUMBNAIL LOGIC */}
            {hasThumbnails && (
                isStory ? (
                    // CLS FIX: Wrap slider in aspect-ratio div to reserve space
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                        <Slider ref={sliderRef} {...sliderSettings}>
                            {article.thumbnails.map((thumb, idx) => (
                                <div key={thumb.id}>
                                    <Link to={postLink} aria-label={`View story: ${article.title}`}>
                                        <ResponsiveAuthImage
                                            baseName={thumb.imageUrl}
                                            alt={thumb.altText || article.title}
                                            className="w-full object-cover bg-gray-100 aspect-video"
                                            eager={eager && idx === 0} // Eager load first image if card is eager
                                        />
                                    </Link>
                                </div>
                            ))}
                        </Slider>
                    </div>
                ) : (
                    <Link to={postLink} aria-label={`View article: ${article.title}`}>
                        <ResponsiveAuthImage
                            baseName={article.thumbnails[0].imageUrl}
                            alt={article.thumbnails[0].altText || article.title}
                            className={`w-full object-cover bg-gray-100 ${isBannerLayout ? 'aspect-video' : 'aspect-square'}`}
                            eager={eager} // Pass eager prop
                        />
                    </Link>
                )
            )}

            {/* CONTENT LOGIC */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center flex-wrap">
                        <button onClick={() => onCategoryClick(categoryName)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{categoryName}</button>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-gray-500 font-medium">By Treishvaam Finance</span>
                    </div>
                    {/* CONTRAST FIX: Darkened red for better readability */}
                    {isNew && <span className="font-semibold text-red-600 flex-shrink-0 ml-2">NEW</span>}
                </div>
                <h3 className={titleClass}>
                    <Link to={postLink} className="hover:underline">{article.title}</Link>
                </h3>
                <div className="mt-auto pt-2 text-xs text-gray-500"><span>{displayDate}</span></div>
            </div>
        </div>
    );
}));

export default MobilePostCard;