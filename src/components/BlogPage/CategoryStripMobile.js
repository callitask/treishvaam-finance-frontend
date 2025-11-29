import React, { useRef, useEffect } from 'react';

const CategoryStripMobile = ({ categories, selectedCategory, setSelectedCategory }) => {
    const scrollRef = useRef(null);
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    // Auto-scroll to selected category
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
                className="flex items-center overflow-x-auto no-scrollbar py-2 px-3 gap-2"
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
                                flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-200 whitespace-nowrap border
                                ${isActive
                                    ? 'bg-sky-700 border-sky-700 text-white shadow-md'
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'
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