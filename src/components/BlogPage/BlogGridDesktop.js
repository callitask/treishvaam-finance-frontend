import React from 'react';
import BannerPostCard from './BannerPostCard';
import GridPostCard from './GridPostCard';
import PostCard from './PostCard';

// --- ENTERPRISE SKELETON LOADER ---
const PostSkeleton = () => (
    <div className="bg-white border border-gray-100 p-4 flex flex-col h-full">
        {/* Thumbnail */}
        <div className="w-full aspect-[16/10] skeleton rounded-sm mb-4"></div>
        {/* Category & Date */}
        <div className="flex justify-between mb-3">
            <div className="h-3 w-20 skeleton rounded-sm"></div>
            <div className="h-3 w-16 skeleton rounded-sm"></div>
        </div>
        {/* Title */}
        <div className="h-6 w-full skeleton rounded-sm mb-2"></div>
        <div className="h-6 w-3/4 skeleton rounded-sm mb-4"></div>
        {/* Excerpt */}
        <div className="h-3 w-full skeleton rounded-sm mb-2"></div>
        <div className="h-3 w-full skeleton rounded-sm mb-2"></div>
        <div className="h-3 w-1/2 skeleton rounded-sm"></div>
    </div>
);

const BlogGridDesktop = ({ desktopLayoutBlocks, lastPostElementRef, onCategoryClick, categoriesMap, loading, page, hasMore, postCount }) => {

    const renderDesktopLayout = () => {
        if (desktopLayoutBlocks.length === 0) {
            if (loading && page === 0) {
                // Initial Load Skeletons (Grid of 9)
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
                        {[...Array(9)].map((_, i) => (
                            <PostSkeleton key={i} />
                        ))}
                    </div>
                );
            }
            return <div className="text-center p-10 col-span-full"><p>No posts found for your criteria.</p></div>;
        }

        return desktopLayoutBlocks.map((block, blockIndex) => {
            const isLastBlock = blockIndex === desktopLayoutBlocks.length - 1;
            if (block.type === 'BANNER') {
                const isLastPost = isLastBlock && block.posts.length === 1;
                const isLCP = blockIndex === 0;
                return <BannerPostCard ref={isLastPost ? lastPostElementRef : null} key={block.id} article={block.posts[0]} onCategoryClick={onCategoryClick} categoriesMap={categoriesMap} eager={isLCP} />;
            }
            if (block.type.startsWith('MULTI_COLUMN')) {
                const columnCount = parseInt(block.type.split('_')[2]) || 2;
                const gridClass = `grid grid-cols-1 md:grid-cols-${columnCount} gap-px bg-gray-200`;
                return (<div key={block.id} className={gridClass}>{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <GridPostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={onCategoryClick} categoriesMap={categoriesMap} />; })}</div>);
            }
            if (block.type === 'DEFAULT') {
                return (<div key={block.id} className="sm:columns-2 md:columns-3 lg:columns-4 gap-px space-y-px bg-gray-200">{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <PostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={onCategoryClick} categoriesMap={categoriesMap} />; })}</div>);
            }
            return null;
        });
    };

    return (
        <main className="lg:col-span-8 order-2 min-h-screen bg-white shadow-sm border border-gray-200">
            {renderDesktopLayout()}

            {/* Pagination Loading State */}
            {loading && page > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-gray-200 border-t border-gray-200">
                    {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
                </div>
            )}

            {!hasMore && postCount > 0 && <div className="text-center p-8 text-sm font-semibold text-gray-400 uppercase tracking-wider">End of Feed</div>}
        </main>
    );
};

export default BlogGridDesktop;