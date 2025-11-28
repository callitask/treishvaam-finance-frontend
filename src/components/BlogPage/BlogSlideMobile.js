import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import BlogSidebar from './BlogSidebar';
import MobilePostCard from './MobilePostCard';

const BlogSlideMobile = ({
    mobileLayout,
    lastPostElementRef,
    onCategoryClick,
    categoriesMap,
    categories,
    selectedCategory,
    setSelectedCategory,
    loadingCategories,
    loading,
    page,
    hasMore
}) => {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    return (
        <div className="outline-none min-h-screen bg-gray-50 pb-20">
            {/* Filter Toggle Bar */}
            <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm px-4 py-2">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-sky-700"
                >
                    <span>{selectedCategory === 'All' ? 'Latest Stories' : selectedCategory}</span>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                        <span>Filter</span>
                        {showMobileFilters ? <FiX size={12} /> : <FiFilter size={12} />}
                    </div>
                </button>
            </div>

            {/* Filter Overlay */}
            {showMobileFilters && (
                <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top-5 duration-200">
                    <BlogSidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        loadingCategories={loadingCategories}
                    />
                </div>
            )}

            {/* Feed Content */}
            {mobileLayout.length === 0 && !loading && page === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <p className="font-serif italic">No stories found.</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {mobileLayout.map((article, index) => {
                        const isLastPost = index === mobileLayout.length - 1;

                        // DESIGN LOGIC: First post is HERO.
                        const isHero = index === 0;

                        return (
                            <div key={article.id} className={isHero ? "mb-2 border-b border-gray-200" : "border-b border-gray-200 bg-white"}>
                                <MobilePostCard
                                    ref={isLastPost ? lastPostElementRef : null}
                                    article={article}
                                    onCategoryClick={onCategoryClick}
                                    categoriesMap={categoriesMap}
                                    eager={index < 2}
                                    isHero={isHero}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Loading/End States */}
            {loading && (
                <div className="p-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-3/4 skeleton"></div>
                                <div className="h-3 bg-gray-100 rounded w-full skeleton"></div>
                            </div>
                            <div className="w-24 h-24 bg-gray-100 rounded skeleton"></div>
                        </div>
                    ))}
                </div>
            )}

            {!hasMore && mobileLayout.length > 0 && (
                <div className="py-8 text-center">
                    <div className="w-12 h-1 bg-gray-200 mx-auto rounded-full mb-2"></div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">End of Feed</p>
                </div>
            )}
        </div>
    );
};

export default BlogSlideMobile;