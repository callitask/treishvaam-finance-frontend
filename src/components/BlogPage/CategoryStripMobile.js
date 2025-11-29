// src/components/BlogPage/CategoryStripMobile.js
import React, { useRef, useEffect } from 'react';

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
        <div className="sticky top-14 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div
                ref={scrollRef}
                className="flex items-center overflow-x-auto no-scrollbar py-2.5 px-3 gap-2"
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
                                flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap border
                                ${isActive
                                    ? 'bg-slate-800 dark:bg-sky-600 border-slate-800 dark:border-sky-600 text-white shadow-md'
                                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-900 dark:hover:text-gray-200'
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

export default CategoryStripMobile;