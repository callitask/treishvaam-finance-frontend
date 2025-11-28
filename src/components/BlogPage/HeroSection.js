import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import NewsHighlights from '../NewsHighlights'; // Re-using your existing component
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

const HeroSection = ({ featuredPost }) => {
    // If no post is available yet, show nothing or a skeleton (handled by parent usually)
    if (!featuredPost) return null;

    const { displayDate } = formatDateTime(featuredPost.updatedAt || featuredPost.createdAt);
    const categoryName = featuredPost.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const postLink = `/category/${featuredPost.category?.slug || 'uncategorized'}/${featuredPost.userFriendlySlug}/${featuredPost.urlArticleId}`;

    // Get first thumbnail for the big image
    const heroImage = featuredPost.thumbnails && featuredPost.thumbnails.length > 0
        ? featuredPost.thumbnails[0].imageUrl
        : featuredPost.coverImageUrl;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 border-b border-gray-200 pb-12">

            {/* LEFT: LEAD STORY (Span 8) */}
            <div className="lg:col-span-8 group">
                <Link to={postLink} className="block relative overflow-hidden rounded-sm mb-4">
                    <div className="aspect-[16/9] w-full bg-gray-100">
                        <ResponsiveAuthImage
                            baseName={heroImage}
                            alt={featuredPost.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            eager={true} // Priority loading for Hero
                        />
                    </div>
                </Link>

                <div className="flex items-center gap-3 text-xs mb-3">
                    <span className={`font-bold uppercase tracking-widest ${categoryClass}`}>
                        {categoryName}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-500 font-medium uppercase tracking-wide">
                        {displayDate}
                    </span>
                </div>

                <Link to={postLink} className="block group-hover:text-sky-700 transition-colors">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 font-serif leading-tight mb-4">
                        {featuredPost.title}
                    </h1>
                </Link>

                <p className="text-gray-600 text-lg leading-relaxed font-light font-serif line-clamp-3">
                    {createSnippet(featuredPost.customSnippet || featuredPost.content, 250)}
                </p>

                <div className="mt-4">
                    <Link to={postLink} className="text-xs font-bold uppercase tracking-widest text-sky-700 hover:underline">
                        Read Full Story &rarr;
                    </Link>
                </div>
            </div>

            {/* RIGHT: BRIEFING / NEWS HIGHLIGHTS (Span 4) */}
            <div className="lg:col-span-4 pl-0 lg:pl-8 border-l border-gray-100">
                <div className="sticky top-28">
                    <div className="flex items-center gap-2 mb-6 border-b border-black pb-2">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                            The Briefing
                        </h3>
                    </div>
                    {/* Re-using your existing NewsHighlights component here */}
                    <NewsHighlights />
                </div>
            </div>
        </div>
    );
};

export default HeroSection;