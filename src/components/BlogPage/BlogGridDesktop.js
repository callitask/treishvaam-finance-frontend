import React from 'react';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';
import { categoryStyles, createSnippet, formatDateTime } from '../../utils/blogUtils';

// ==============================================================================
// SUB-COMPONENT: FeedRowCard (The "Focus" Item - Horizontal)
// ==============================================================================
const FeedRowCard = ({ article, onCategoryClick, categoriesMap }) => {
    const { displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const categoryClass = categoryStyles[categoryName] || categoryStyles["Default"];
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    // Safe thumbnail access
    const thumbnail = article.thumbnails && article.thumbnails.length > 0 ? article.thumbnails[0] : {};

    return (
        <div className="group flex flex-col md:flex-row gap-6 py-8 border-b border-gray-100 last:border-0 items-start">

            {/* THUMBNAIL (Standard 4:3 Aspect) */}
            <Link to={postLink} className="block w-full md:w-[240px] shrink-0 aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 relative">
                {thumbnail.imageUrl ? (
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={400}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                )}
            </Link>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 flex flex-col h-full justify-center">
                <div className="flex items-center gap-3 mb-2 text-[11px] uppercase tracking-wider font-bold">
                    <button onClick={() => onCategoryClick(categoryName)} className={`${categoryClass} hover:underline`}>
                        {categoryName}
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-400">{displayDate}</span>
                </div>

                <Link to={postLink} className="group-hover:text-sky-700 transition-colors">
                    <h3 className="text-xl font-bold text-gray-900 font-serif leading-snug mb-3">
                        {article.title}
                    </h3>
                </Link>

                <p className="text-gray-600 text-sm leading-relaxed font-serif line-clamp-2 md:line-clamp-3">
                    {createSnippet(article.customSnippet || article.content, 180)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                    <Link to={postLink} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-sky-600 transition-colors">
                        Read Analysis
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ==============================================================================
// SUB-COMPONENT: FeedGridCard (The "Flow" Item - Compact Vertical)
// ==============================================================================
const FeedGridCard = ({ article, onCategoryClick, categoriesMap }) => {
    const { displayDate } = formatDateTime(article.updatedAt || article.createdAt);
    const categoryName = article.category?.name || 'Uncategorized';
    const categorySlug = categoriesMap[categoryName] || 'uncategorized';
    const postLink = `/category/${categorySlug}/${article.userFriendlySlug}/${article.urlArticleId}`;

    const thumbnail = article.thumbnails && article.thumbnails.length > 0 ? article.thumbnails[0] : {};

    return (
        <div className="group flex flex-col h-full bg-white border border-gray-100 rounded-sm hover:shadow-md transition-shadow duration-300 p-4">

            {/* THUMBNAIL (16:9 Aspect for Grid) */}
            <Link to={postLink} className="block w-full aspect-video overflow-hidden bg-gray-100 mb-4 rounded-sm relative">
                {thumbnail.imageUrl ? (
                    <ResponsiveAuthImage
                        baseName={thumbnail.imageUrl}
                        alt={thumbnail.altText || article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        width={400}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                )}
                <div className="absolute top-2 left-2">
                    <span className="bg-white/90 backdrop-blur text-[9px] font-bold px-2 py-1 uppercase tracking-widest rounded-sm text-gray-800">
                        {categoryName}
                    </span>
                </div>
            </Link>

            {/* CONTENT */}
            <div className="flex flex-col flex-grow">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {displayDate}
                </div>

                <Link to={postLink} className="group-hover:text-sky-700 transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 font-serif leading-tight mb-2 line-clamp-3">
                        {article.title}
                    </h3>
                </Link>
            </div>
        </div>
    );
};

// ==============================================================================
// MAIN COMPONENT: BlogGridDesktop
// ==============================================================================

// Skeleton for loading state
const FeedSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 h-40">
                <div className="w-[240px] bg-gray-200 h-full rounded"></div>
                <div className="flex-1 py-2 space-y-3">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

const BlogGridDesktop = ({
    desktopLayoutBlocks,
    lastPostElementRef,
    onCategoryClick,
    categoriesMap,
    loading,
    page,
    hasMore
}) => {

    // Logic: Flatten the blocks into a single list of posts
    let allPosts = [];
    if (desktopLayoutBlocks && desktopLayoutBlocks.length > 0) {
        desktopLayoutBlocks.forEach(block => {
            if (block.posts && Array.isArray(block.posts)) {
                allPosts = [...allPosts, ...block.posts];
            }
        });
    }

    if (loading && page === 0) {
        return <FeedSkeleton />;
    }

    if (allPosts.length === 0) {
        return (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 font-serif italic">No analysis found for this section.</p>
            </div>
        );
    }

    // Split Logic: First 3 get "Focus" treatment, rest get "Grid" treatment
    const splitIndex = 3;
    const focusPosts = allPosts.slice(0, splitIndex);
    const gridPosts = allPosts.slice(splitIndex);

    return (
        <div className="w-full">

            {/* ZONE 1: THE FOCUS FEED (River) */}
            <div className="flex flex-col border-t border-gray-100">
                {focusPosts.map((article, index) => {
                    const isLast = gridPosts.length === 0 && index === focusPosts.length - 1;
                    return (
                        <div key={article.id} ref={isLast ? lastPostElementRef : null}>
                            <FeedRowCard
                                article={article}
                                onCategoryClick={onCategoryClick}
                                categoriesMap={categoriesMap}
                            />
                        </div>
                    );
                })}
            </div>

            {/* ZONE 2: THE ARCHIVE GRID (2-Col) */}
            {gridPosts.length > 0 && (
                <div className="mt-12 pt-8 border-t-2 border-black">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                            More Analysis
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gridPosts.map((article, index) => {
                            const isLast = index === gridPosts.length - 1;
                            return (
                                <div key={article.id} ref={isLast ? lastPostElementRef : null}>
                                    <FeedGridCard
                                        article={article}
                                        onCategoryClick={onCategoryClick}
                                        categoriesMap={categoriesMap}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* LOADING STATE FOR PAGINATION */}
            {loading && page > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex justify-center items-center gap-2 text-gray-400 text-sm font-medium animate-pulse">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Loading more insights...
                    </div>
                </div>
            )}

            {!hasMore && allPosts.length > 0 && (
                <div className="mt-12 py-8 text-center border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
                        End of Feed
                    </span>
                </div>
            )}
        </div>
    );
};

export default BlogGridDesktop;