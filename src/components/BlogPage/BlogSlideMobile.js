// src/components/BlogPage/BlogSlideMobile.js
import React from 'react';
import { Link } from 'react-router-dom';
import MobilePostCard from './MobilePostCard';
import CategoryStripMobile from './CategoryStripMobile';
import GlobalMarketTicker from '../market/GlobalMarketTicker';

const BlogSlideMobile = ({
    mobileLayout,
    lastPostElementRef,
    onCategoryClick,
    categoriesMap,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    page,
    hasMore
}) => {

    const heroPost = mobileLayout[0];
    const railPosts = mobileLayout.slice(1, 6);
    const listPosts = mobileLayout.slice(6);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 pb-24 w-full overflow-x-hidden transition-colors duration-300">

            {/* 1. MARKET TICKER */}
            <GlobalMarketTicker mobileMode={true} />

            {/* 2. CATEGORY NAV */}
            <CategoryStripMobile
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 3. HERO STORY */}
            {heroPost && (
                <div className="mb-0 border-t border-gray-100 dark:border-slate-800">
                    <MobilePostCard
                        article={heroPost}
                        onCategoryClick={onCategoryClick}
                        categoriesMap={categoriesMap}
                        isHero={true}
                    />
                </div>
            )}

            {/* 4. MUST READS RAIL */}
            {railPosts.length > 0 && (
                <div className="py-5 pl-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 mb-3">
                    <div className="flex items-center justify-between pr-4 mb-3">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-4 bg-sky-700 dark:bg-sky-500 rounded-sm"></span>
                            Must Reads
                        </h4>
                        <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-slate-800 px-2 py-1 rounded">Swipe</span>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 pr-4 no-scrollbar">
                        {railPosts.map(post => (
                            <Link
                                key={post.id}
                                to={`/category/${post.category?.slug || 'news'}/${post.userFriendlySlug}/${post.urlArticleId}`}
                                className="flex-shrink-0 w-64 bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{post.category?.name}</span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 font-serif">
                                    {post.title}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 5. MAIN FEED */}
            <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Latest Stories</h4>
                </div>

                {listPosts.length > 0 ? (
                    listPosts.map((article, index) => {
                        const isLastPost = index === listPosts.length - 1;
                        return (
                            <MobilePostCard
                                key={article.id}
                                ref={isLastPost ? lastPostElementRef : null}
                                article={article}
                                onCategoryClick={onCategoryClick}
                                categoriesMap={categoriesMap}
                            />
                        );
                    })
                ) : (
                    !loading && page === 0 && (
                        <div className="py-20 text-center text-gray-400 italic">No stories found.</div>
                    )
                )}
            </div>

            {/* 6. LOADING */}
            {loading && (
                <div className="p-4 space-y-4 bg-white dark:bg-slate-900">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 border-b border-gray-100 dark:border-slate-800 pb-4 last:border-0">
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/4 skeleton"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full skeleton"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 skeleton"></div>
                            </div>
                            <div className="w-[100px] h-[75px] bg-gray-200 dark:bg-slate-700 rounded skeleton"></div>
                        </div>
                    ))}
                </div>
            )}

            {!hasMore && mobileLayout.length > 0 && (
                <div className="py-8 text-center bg-gray-100 dark:bg-slate-950">
                    <div className="w-12 h-1 bg-gray-300 dark:bg-slate-700 mx-auto rounded-full mb-2"></div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">End of Feed</p>
                </div>
            )}
        </div>
    );
};

export default BlogSlideMobile;