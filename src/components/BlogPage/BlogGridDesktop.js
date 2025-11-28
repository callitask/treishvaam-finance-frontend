import React from 'react';
import FeedRowCard from './FeedRowCard';
import FeedTextCard from './FeedTextCard'; // The new component
import FeedGridCard from './FeedGridCard';

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
    desktopLayoutBlocks,
    lastPostElementRef,
    onCategoryClick,
    categoriesMap,
    loading,
    page,
    hasMore
}) => {

    // Flatten logic
    let allPosts = [];
    if (desktopLayoutBlocks && desktopLayoutBlocks.length > 0) {
        desktopLayoutBlocks.forEach(block => {
            if (block.posts && Array.isArray(block.posts)) {
                allPosts = [...allPosts, ...block.posts];
            }
        });
    }

    if (loading && page === 0) return <FeedSkeleton />;
    if (allPosts.length === 0) return <div className="py-20 text-center"><p className="text-gray-500 italic">No analysis found.</p></div>;

    // --- THE "RHYTHM" SPLIT LOGIC ---
    // 1. The Anchor (First post)
    const anchorPost = allPosts[0];

    // 2. The Briefing Strip (Next 3 posts)
    const briefingPosts = allPosts.slice(1, 4);

    // 3. The Grid (Everything else)
    const gridPosts = allPosts.slice(4);

    return (
        <div className="w-full">

            {/* ZONE 1: THE ANCHOR */}
            {anchorPost && (
                <div className="mb-8">
                    <FeedRowCard
                        article={anchorPost}
                        onCategoryClick={onCategoryClick}
                        categoriesMap={categoriesMap}
                    />
                </div>
            )}

            {/* ZONE 2: THE BRIEFING STRIP (Row of 3 Text Cards) */}
            {briefingPosts.length > 0 && (
                <div className="mb-10 py-6 border-y border-gray-100 bg-white">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                        Quick Reads
                    </h4>
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

            {/* ZONE 3: THE ARCHIVE GRID (2-Col) */}
            {gridPosts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 bg-sky-600 rounded-full"></span>
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                            In Depth
                        </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
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

            {/* LOADING STATE */}
            {loading && page > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                    Loading more...
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