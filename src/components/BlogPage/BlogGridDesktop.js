import React from 'react';
import FeedRowCard from './FeedRowCard';
import FeedTextCard from './FeedTextCard';
import FeedGridCard from './FeedGridCard';

/**
 * [AI-OPTIMIZED CONTEXT]
 * Component: BlogGridDesktop
 * Purpose: Renders the main content area of the blog feed on desktop screens.
 * * CHANGES (Performance & SEO):
 * 1. Heading Hierarchy Fix: Promoted "Quick Reads" and "In Depth" headers from <h4> to <h3>.
 * - Reason: The page title is <h1>, Section titles should be <h2>, and these subsections must be <h3>.
 * - Impact: Fixes "Heading levels skipped" SEO error in Lighthouse.
 * * 2. Structure: 
 * - Zone 1: Secondary Lead (FeedRowCard)
 * - Zone 2: Briefing Strip (FeedTextCard grid)
 * - Zone 3: Main Feed (FeedGridCard grid)
 * * FUTURE MAINTENANCE:
 * - Ensure any new section headers added here start at <h3> level.
 * - Do not revert to <h4> unless nested inside an <h3> container.
 */

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
                </div>
            </div>
        ))}
    </div>
);

const BlogGridDesktop = ({
    mustReadPost,
    briefingPosts,
    feedPosts,
    lastPostElementRef,
    onCategoryClick,
    categoriesMap,
    loading,
    page,
    hasMore
}) => {

    if (loading && page === 0) return <FeedSkeleton />;

    // Check if we have literally no content to show in this grid area
    if (!mustReadPost && briefingPosts.length === 0 && feedPosts.length === 0) {
        return <div className="py-20 text-center"><p className="text-gray-500 italic">No analysis found.</p></div>;
    }

    return (
        <div className="w-full">

            {/* ZONE 1: THE SECONDARY LEAD (Must Read) */}
            {mustReadPost && (
                <div className="mb-8">
                    <FeedRowCard
                        article={mustReadPost}
                        onCategoryClick={onCategoryClick}
                        categoriesMap={categoriesMap}
                    />
                </div>
            )}

            {/* ZONE 2: THE BRIEFING STRIP (Market Briefs) */}
            {briefingPosts && briefingPosts.length > 0 && (
                <div className="mb-10 py-6 border-y border-gray-100 bg-white">
                    {/* SEO FIX: Promoted to H3 */}
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Quick Reads
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {briefingPosts.map(article => (
                            <FeedTextCard
                                key={article.id}
                                article={article}
                                onCategoryClick={onCategoryClick}
                                categoriesMap={categoriesMap}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ZONE 3: THE MAIN FEED (Standard) */}
            {feedPosts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 bg-sky-600 rounded-full"></span>
                        {/* SEO FIX: Promoted to H3 */}
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                            In Depth
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {feedPosts.map((article, index) => {
                            const isLast = index === feedPosts.length - 1;
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

            {/* LOADING STATE */}
            {loading && page > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                    Loading more...
                </div>
            )}

            {!hasMore && feedPosts.length > 0 && (
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