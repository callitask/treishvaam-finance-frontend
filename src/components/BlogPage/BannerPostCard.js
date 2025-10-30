import React, { memo, forwardRef, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import Slider from "react-slick";
import { createSnippet, formatDateTime } from '../../utils/blogUtils';

const BannerPostCard = memo(forwardRef(({ article, onCategoryClick, categoriesMap, eager = false }, ref) => {
    const sliderRef = useRef(null);
    const hasThumbnails = article.thumbnails && article.thumbnails.length > 0;
    const isStory = hasThumbnails && article.thumbnails.length > 1;
    const { isNew, displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const bannerSliderSettings = { dots: false, fade: true, infinite: true, speed: 1000, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 4000, arrows: false, pauseOnHover: false };

    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const ThumbnailDisplay = () => {
        if (!hasThumbnails) {
            return <div className="aspect-video bg-gray-200"></div>; // Placeholder maintains aspect ratio
        }
        if (isStory) {
            // Use first thumb metadata to set aspect ratio if available
            const firstThumb = article.thumbnails[0] || {};
            const aspectStyle = (firstThumb.width && firstThumb.height) ? { aspectRatio: `${firstThumb.width} / ${firstThumb.height}` } : { minHeight: 400 };
            return (
                <div style={aspectStyle} className="w-full bg-gray-100">
                    <Slider ref={sliderRef} {...bannerSliderSettings}>
                        {article.thumbnails.map((thumb, index) => ( // Added index for eager prop
                            <div key={thumb.id}>
                                <ResponsiveAuthImage
                                    baseName={thumb.imageUrl}
                                    alt={thumb.altText || article.title}
                                    className="w-full h-full object-cover"
                                    width={thumb.width}
                                    height={thumb.height}
                                    blurHash={thumb.blurHash}
                                    eager={eager && index === 0}
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            );
        }
        const thumb = article.thumbnails[0];
        const aspectStyle = (thumb.width && thumb.height) ? { aspectRatio: `${thumb.width} / ${thumb.height}` } : { minHeight: 400 };
        return (
            <div style={aspectStyle} className="w-full bg-gray-100">
                <ResponsiveAuthImage
                    baseName={thumb.imageUrl}
                    alt={thumb.altText || article.title}
                    className="w-full h-full object-cover"
                    width={thumb.width}
                    height={thumb.height}
                    blurHash={thumb.blurHash}
                    eager={eager}
                />
            </div>
        );
    };

    return (<div ref={ref} className="block relative bg-black text-white overflow-hidden border border-gray-200 group"><div className="absolute inset-0"><ThumbnailDisplay /></div><div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent group-hover:via-black/80 transition-all duration-300"></div><Link to={postLink} className="relative p-8 flex flex-col justify-end min-h-[400px] z-10"><div className="flex justify-between items-center text-sm mb-2"><div className="flex items-center gap-3"><span onClick={(e) => { e.preventDefault(); onCategoryClick(categoryName); }} className="font-bold uppercase tracking-wider text-sky-300 hover:underline cursor-pointer">{categoryName}</span><span className="text-gray-400">|</span><span className="text-gray-300">{displayDate}</span></div>{isNew && <span className="font-semibold text-red-500 bg-white/20 px-2 py-1 rounded-full text-xs">NEW</span>}</div><h2 className="text-3xl md:text-4xl font-bold my-2 leading-tight text-white group-hover:text-sky-200 transition-colors duration-300">{article.title}</h2><p className="text-gray-200 text-base mt-2 max-w-2xl hidden md:block">{createSnippet(article.customSnippet || article.content, 150)}</p><div className="text-xs text-gray-400 mt-4">By Treishvaam Finance</div></Link></div>);
}));

export default BannerPostCard;
