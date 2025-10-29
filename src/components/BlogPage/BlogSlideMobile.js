import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import SearchAutocomplete from '../SearchAutocomplete';
import BlogSidebar from './BlogSidebar'; // Note the new path
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
        <div className="outline-none">
            {/* Mobile Filters and Search */}
            <div className="px-4 py-4">
                <div className="border-b border-gray-200 mb-4">
                    <button onClick={() => setShowMobileFilters(!showMobileFilters)} className="w-full flex justify-between items-center py-3 text-lg font-semibold text-gray-800">
                        {showMobileFilters ? 'Hide Filters' : 'Filters & Categories'}
                        {showMobileFilters ? <FiX /> : <FiFilter />}
                    </button>
                    {showMobileFilters && (
                        <div className="py-4">
                            <BlogSidebar
                                categories={categories}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                loadingCategories={loadingCategories}
                            />
                        </div>
                    )}
                </div>
                <SearchAutocomplete />
            </div>

            {/* Mobile Post Grid */}
            {mobileLayout.length === 0 && !loading && page === 0 ? (
                <div className="text-center p-10"><p>No posts found.</p></div>
            ) : (
                <div className="grid grid-cols-2 gap-2 p-2">
                    {mobileLayout.map((article, index) => {
                        const isLastPost = index === mobileLayout.length - 1;
                        return <MobilePostCard
                            ref={isLastPost ? lastPostElementRef : null}
                            key={article.id}
                            article={article}
                            onCategoryClick={onCategoryClick}
                            layout={article.layout}
                            categoriesMap={categoriesMap}
                        />;
                    })}
                </div>
            )}

            {/* Mobile Loading/End Indicators */}
            {loading && page > 0 && <div className="text-center p-4">Loading...</div>}
            {!hasMore && mobileLayout.length > 0 && <div className="text-center p-4 text-gray-500">You've reached the end.</div>}
        </div>
    );
};

export default BlogSlideMobile;
