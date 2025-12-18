import React from 'react';

const CategoryStrip = ({ categories, selectedCategory, setSelectedCategory, loading }) => {
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    if (loading) {
        return (
            <div className="w-full h-12 bg-white border-b border-gray-200 animate-pulse flex items-center px-4 gap-4">
                <div className="h-4 w-16 bg-gray-100 rounded"></div>
                <div className="h-4 w-20 bg-gray-100 rounded"></div>
                <div className="h-4 w-14 bg-gray-100 rounded"></div>
                <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
        );
    }

    return (
        // CHANGED: Removed sticky, top, and z-index. Now just a normal block.
        // The sticking is handled by the parent wrapper in BlogPage.js
        <div className="w-full bg-white border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-12 overflow-x-auto no-scrollbar gap-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4 flex-shrink-0">
                        Sections
                    </span>
                    {allCategories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    px-4 h-full flex items-center text-xs font-bold uppercase tracking-wide transition-all duration-200 whitespace-nowrap border-b-2
                                    ${isActive
                                        ? 'border-sky-600 text-sky-700 bg-sky-50/50'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CategoryStrip;