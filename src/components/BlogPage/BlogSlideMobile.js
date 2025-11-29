import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MobilePostCard from './MobilePostCard';

// --- INTERNAL COMPONENT: APP TABS (Fixes Import Error) ---
const CategoryTabs = ({ categories, selectedCategory, setSelectedCategory }) => {
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
        <div className="sticky top-14 z-30 bg-white border-b border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div
                ref={scrollRef}
                className="flex items-center overflow-x-auto no-scrollbar py-3 px-4 gap-3"
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
                                flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 shadow-sm
                                ${isActive
                                    ? 'bg-sky-600 text-white shadow-sky-200'
                                    : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
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

// --- MAIN FEED COMPONENT ---
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

    // Split Data
    const heroPost = mobileLayout[0];
    const railPosts = mobileLayout.slice(1, 4);
    const listPosts = mobileLayout.slice(4);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 w-full overflow-x-hidden">

            {/* 1. APP TABS */}
            <CategoryTabs
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />

            {/* 2. HERO POST (Cinematic) */}
            {heroPost && (
                <div className="mb-4">
                    <MobilePostCard
                        article={heroPost}
                        onCategoryClick={onCategoryClick}
                        categoriesMap={categoriesMap}
                        isHero={true}
                    />
                </div>
            )}

            {/* 3. HORIZONTAL BRIEFING RAIL */}
            {railPosts.length > 0 && (
                <div className="py-6 pl-5 bg-white border-y border-gray-100 mb-4 shadow-sm">
                    <div className="flex items-center justify-between pr-5 mb-4">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">
                            Must Reads
                        </h4>
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">Swipe →</span>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-2 pr-5 no-scrollbar">
                        {railPosts.map(post => (
                            <Link
                                key={post.id}
                                to={`/category/${post.category?.slug || 'news'}/${post.userFriendlySlug}/${post.urlArticleId}`}
                                className="flex-shrink-0 w-72 bg-white p-4 rounded-xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 transition-transform"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">{post.category?.name}</span>
                                </div>
                                <h4 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 font-serif">
                                    {post.title}
                                </h4>
                                <div className="mt-3 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                    Read Analysis
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. MAIN FEED LIST */}
            <div className="bg-white border-t border-gray-100">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Latest Stories</h4>
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

            {/* 5. LOADING SKELETONS */}
            {loading && (
                <div className="p-5 space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/3 skeleton"></div>
                                <div className="h-5 bg-gray-200 rounded w-full skeleton"></div>
                                <div className="h-5 bg-gray-200 rounded w-2/3 skeleton"></div>
                            </div>
                            <div className="w-24 h-24 bg-gray-200 rounded-lg skeleton"></div>
                        </div>
                    ))}
                </div>
            )}

            {!hasMore && mobileLayout.length > 0 && (
                <div className="py-10 text-center bg-gray-50">
                    <div className="w-16 h-1 bg-gray-300 mx-auto rounded-full mb-3"></div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">You're all caught up</p>
                </div>
            )}
        </div>
    );
};

export default BlogSlideMobile;