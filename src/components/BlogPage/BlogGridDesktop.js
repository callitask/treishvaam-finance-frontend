import React from 'react';
import BannerPostCard from './BannerPostCard';
import GridPostCard from './GridPostCard';
import PostCard from './PostCard';

const BlogGridDesktop = ({ desktopLayoutBlocks, lastPostElementRef, onCategoryClick, categoriesMap, loading, page, hasMore, postCount }) => {

    const renderDesktopLayout = () => {
        if (desktopLayoutBlocks.length === 0 && !loading && page === 0) {
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
                const gridClass = `grid grid-cols-1 md:grid-cols-${columnCount} gap-px`;
                return (<div key={block.id} className={gridClass}>{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <GridPostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={onCategoryClick} categoriesMap={categoriesMap} />; })}</div>);
            }
            if (block.type === 'DEFAULT') {
                return (<div key={block.id} className="sm:columns-2 md:columns-3 lg:columns-4 gap-px">{block.posts.map((article, postIndex) => { const isLastPost = isLastBlock && postIndex === block.posts.length - 1; return <PostCard ref={isLastPost ? lastPostElementRef : null} key={article.id} article={article} onCategoryClick={onCategoryClick} categoriesMap={categoriesMap} />; })}</div>);
            }
            return null;
        });
    };

    return (
        <main className="lg:col-span-8 order-2 min-h-screen py-6 bg-white">
            {renderDesktopLayout()}
            {loading && page > 0 && <div className="text-center p-10 col-span-full">Loading more posts...</div>}
            {!hasMore && postCount > 0 && <div className="text-center p-10 col-span-full text-gray-500">You've reached the end.</div>}
        </main>
    );
};

export default BlogGridDesktop;
