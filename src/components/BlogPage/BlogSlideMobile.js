import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobilePostCard from './MobilePostCard';

// ==============================================================================
// SUB-COMPONENT: CategoryStripMobile
// ==============================================================================
const CategoryStripMobile = ({ categories, selectedCategory, setSelectedCategory }) => {
    const scrollRef = useRef(null);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    useEffect(() => {
        if (scrollRef.current) {
            const selectedBtn = scrollRef.current.querySelector('[data-selected="true"]');
            if (selectedBtn) {
                selectedBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [selectedCategory]);

    return (
        <div className="sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div
                ref={scrollRef}
                className="flex items-center overflow-x-auto no-scrollbar py-0 px-2 gap-1 h-12"
            >
                {allCategories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                        <button
                            key={cat}
                            data-selected={isActive}
                            onClick={() => {
                                setSelectedCategory(cat);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`
                                flex-shrink-0 px-4 h-full flex items-center justify-center text-[13px] font-medium transition-all duration-200 whitespace-nowrap border-b-[3px]
                                ${isActive
                                    ? 'border-sky-600 text-sky-700 font-bold'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                }
                            `}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ==============================================================================
// MAIN COMPONENT: BlogSlideMobile
// ==============================================================================
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
    const railPosts = mobileLayout.slice(1, 4);
    const listPosts = mobileLayout.slice(4);

    return (
        <div className="outline-none min-h-screen bg-gray-50 pb-24">

            {/* 1. APP-LIKE CATEGORY NAV */}
            <CategoryStripMobile
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 2. HERO POST */}
            {heroPost && (
                <div className="mb-2 border-b border-gray-200">
                    <MobilePostCard
                        article={heroPost}
                        onCategoryClick={onCategoryClick}
                        categoriesMap={categoriesMap}
                        isHero={true}
                    />
                </div>
            )}

            {/* 3. BRIEFING RAIL */}
            {railPosts.length > 0 && (
                <div className="py-5 pl-4 bg-white border-b border-gray-100 mb-2">
                    <div className="flex items-center justify-between pr-4 mb-3">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                            Quick Reads
                        </h4>
                        <span className="text-[10px] font-bold text-sky-600">Swipe →</span>
                    </div>
                    <div className="flex overflow-x-auto gap-3 pb-2 pr-4 no-scrollbar">
                        {railPosts.map(post => (
                            <Link
                                key={post.id}
                                to={`/category/${post.category?.slug || 'news'}/${post.userFriendlySlug}/${post.urlArticleId}`}
                                className="flex-shrink-0 w-64 bg-slate-50 p-4 rounded-xl border border-gray-100 snap-center active:scale-95 transition-transform duration-200"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{post.category?.name}</span>
                                </div>
                                <h4 className="text-[15px] font-bold text-gray-900 leading-snug line-clamp-3 font-serif">
                                    {post.title}
                                </h4>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. STANDARD FEED LIST */}
            <div className="bg-white">
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

            {/* Loading/End States */}
            {loading && (
                <div className="p-4 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-100 rounded w-3/4 skeleton"></div>
                                <div className="h-3 bg-gray-100 rounded w-full skeleton"></div>
                            </div>
                            <div className="w-24 h-20 bg-gray-100 rounded skeleton"></div>
                        </div>
                    ))}
                </div>
            )}

            {!hasMore && mobileLayout.length > 0 && (
                <div className="py-8 text-center bg-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">You're all caught up</p>
                </div>
            )}
        </div>
    );
};

export default BlogSlideMobile;