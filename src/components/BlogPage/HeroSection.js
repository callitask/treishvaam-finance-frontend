/**
 * AI-CONTEXT:
 * Purpose: Displays the main featured article (LCP Element) at the top of the blog feed.
 * Changes:
 * - Added explicit width/height to ResponsiveAuthImage for CLS prevention.
 * - Maintained strict sizes attribute for LCP optimization.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Optimized 'sizes' attribute for better Mobile LCP (100vw priority)
 * • Enforced width/height to prevent layout shifts
 * - EDITED (LCP OPTIMIZATION):
 * • Tuned desktop 'sizes' from 1280px to 860px
 * • Reason: Match actual grid width to trigger 1200w/800w WebP variant instead of Master
 */
import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

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
                    {/* CLS FIX: Added explicit width/height to define aspect ratio immediately */}
                    <ResponsiveAuthImage
                        baseName={heroImage}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        eager={true}
                        // AI-NOTE: Desktop grid width is ~860px (col-span-8). 
                        // Setting sizes="860px" allows browser to pick the 1200w WebP variant (~200KB)
                        // instead of the 1920w/Original (~3MB).
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 860px"
                        width={1280}
                        height={720}
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