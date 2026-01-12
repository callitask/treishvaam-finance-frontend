import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

/**
 * [AI-OPTIMIZED CONTEXT]
 * Component: HeroSection
 * Purpose: Displays the main featured article (LCP Element) at the top of the blog feed.
 * * CHANGES (Performance LCP):
 * 1. 'sizes' Attribute Refinement: 
 * - Old: "(max-width: 768px) 100vw, 50vw"
 * - New: "(max-width: 768px) 95vw, (max-width: 1280px) 66vw, 50vw"
 * - Reason: 
 * - On Mobile (<768px): The image is effectively full width (95vw).
 * - On Laptop (768-1280px): The layout uses 'lg:col-span-8', which is 8/12 (66%) of the container. 
 * - On Desktop (>1280px): The layout uses 'xl:col-span-6', which is 6/12 (50%) of the container.
 * - Impact: This tells the browser *exactly* how wide the slot is, preventing it from fetching the 1900w image when a 600w-800w one suffices.
 * * 2. Eager Loading: 'eager={true}' and 'fetchpriority="high"' are critical here as this is the Largest Contentful Paint.
 * * FUTURE MAINTENANCE:
 * - If the grid column span changes in 'BlogPage.js', update the 'sizes' attribute here to match.
 */
const HeroSection = ({ featuredPost }) => {
    if (!featuredPost) return null;

    const { displayDate } = formatDateTime(featuredPost.updatedAt || featuredPost.createdAt);
    const categoryName = featuredPost.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const postLink = `/category/${featuredPost.category?.slug || 'uncategorized'}/${featuredPost.userFriendlySlug}/${featuredPost.urlArticleId}`;

    const heroImage = featuredPost.thumbnails && featuredPost.thumbnails.length > 0
        ? featuredPost.thumbnails[0].imageUrl
        : featuredPost.coverImageUrl;

    return (
        <div className="mb-10 pb-10 border-b border-gray-200 group">
            <Link to={postLink} className="block relative aspect-video overflow-hidden rounded-sm mb-5">
                <div className="w-full h-full bg-gray-100">
                    {/* PERFORMANCE FIX: Strictly matched sizes to CSS grid columns to reduce LCP payload */}
                    <ResponsiveAuthImage
                        baseName={heroImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        eager={true}
                        sizes="(max-width: 768px) 95vw, (max-width: 1280px) 66vw, 50vw"
                    />
                </div>
            </Link>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs">
                    <span className={`font-bold uppercase tracking-widest ${categoryClass}`}>
                        {categoryName}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 font-medium uppercase tracking-wide">
                        {displayDate}
                    </span>
                </div>

                <Link to={postLink} className="group-hover:text-sky-700 transition-colors">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-serif leading-tight">
                        {featuredPost.title}
                    </h1>
                </Link>

                <p className="text-gray-600 text-base leading-relaxed font-serif line-clamp-3">
                    {createSnippet(featuredPost.customSnippet || featuredPost.content, 200)}
                </p>
            </div>
        </div>
    );
};

export default HeroSection;