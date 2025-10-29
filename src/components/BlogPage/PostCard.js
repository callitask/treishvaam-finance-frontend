import React, { memo, forwardRef, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import Slider from "react-slick";
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

const PostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew } = formatDateTime(article.updatedAt || article.createdAt);
    const displayDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(article.updatedAt || article.createdAt));
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const isFeatured = article.featured;
    const totalSlides = article.thumbnails?.length || 0;
    const landscapeSlidesToShow = Math.min(totalSlides, 4);
    const landscapeSettings = { dots: false, infinite: totalSlides > landscapeSlidesToShow, speed: 500, slidesToShow: landscapeSlidesToShow, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, arrows: false };

    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const CardContent = () => (<div className="p-3 flex flex-col flex-grow"><div className="flex justify-between items-start text-xs mb-2"><div className="flex items-center"><button onClick={() => onCategoryClick(categoryName)} className={`font-bold uppercase tracking-wider ${categoryClass} hover:underline`}>{categoryName}</button><span className="text-gray-400 mx-2">|</span><span className="text-gray-500 font-medium">By Treishvaam Finance</span></div>{isNew && <span className="font-semibold text-red-500 flex-shrink-0">NEW</span>}</div><h3 className="text-lg font-bold mb-2 text-gray-900 leading-tight break-words"><Link to={postLink} className="hover:underline">{article.title}</Link></h3><p className="text-sm text-gray-700 flex-grow break-words">{createSnippet(article.customSnippet || article.content, 100)}</p><div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"><div className="text-xs text-gray-500"><span>{displayDate}</span></div><Link to={postLink} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex-shrink-0 ml-2">Read More</Link></div></div>);

    const ThumbnailDisplay = () => {
        if (!hasThumbnails) return null;
        if (isStory) {
            return (
                <div className="aspect-video bg-gray-100">
                    <Slider ref={sliderRef} {...landscapeSettings}>
                        {article.thumbnails.map(thumb => (
                            <div key={thumb.id} className="px-px">
                                <Link to={postLink} className="block w-full h-full">
                                    <ResponsiveAuthImage baseName={thumb.imageUrl} alt={thumb.altText || article.title} className="w-full h-full object-cover" />
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            );
        }
        const singleThumbnail = article.thumbnails[0];
        return (
            <Link to={postLink} className="block aspect-[4/3] bg-gray-100">
                <ResponsiveAuthImage baseName={singleThumbnail.imageUrl} alt={singleThumbnail.altText || article.title} className="w-full h-full object-cover" />
            </Link>
        );
    };

    return (<div ref={ref} className="break-inside-avoid bg-white border border-gray-200 mb-px relative flex flex-col">{isFeatured && (<div className="absolute top-2 left-2 z-10"><span className="bg-gradient-to-r from-yellow-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">Featured</span></div>)}<ThumbnailDisplay /><CardContent /></div>);
}));

export default PostCard;
