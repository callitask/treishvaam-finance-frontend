import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CategoryStrip = ({ categories, selectedCategory, setSelectedCategory, loading }) => {
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const megaMenuRef = useRef(null);

    // Filter "All" plus the API categories
    const allCategories = ['All', ...categories.map(cat => cat.name)];

    // Show only the first 10 items in the strip to avoid endless scrolling
    const visibleCount = 10;
    const visibleCategories = allCategories.slice(0, visibleCount);
    const hiddenCategories = allCategories.slice(visibleCount);
    const hasMore = hiddenCategories.length > 0;

    // Close Mega Menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
                setIsMegaMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCategoryClick = (cat) => {
        setSelectedCategory(cat);
        setIsMegaMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="w-full h-10 bg-white border-b border-gray-200 animate-pulse flex items-center px-4 gap-4 justify-center">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-3 w-16 bg-gray-100 rounded"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full bg-white border-b border-gray-200 z-40 relative shadow-sm">
            <div className="container mx-auto px-6 relative">

                {/* HORIZONTAL STRIP */}
                <div className="flex items-center justify-center h-10 gap-6">
                    {visibleCategories.map((cat) => {
                        const isActive = selectedCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => handleCategoryClick(cat)}
                                className={`
                                    h-full flex items-center text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border-b-2
                                    ${isActive
                                        ? 'border-sky-600 text-sky-700'
                                        : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200'
                                    }
                                `}
                            >
                                {cat}
                            </button>
                        );
                    })}

                    {/* "MORE" BUTTON - Triggers the Mega Menu */}
                    {hasMore && (
                        <button
                            onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                            className={`
                                h-full flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2
                                ${isMegaMenuOpen ? 'text-sky-700 border-sky-600' : 'text-gray-400 border-transparent hover:text-sky-600'}
                            `}
                        >
                            More {isMegaMenuOpen ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
                        </button>
                    )}
                </div>

                {/* MEGA MENU OVERLAY (The "Wide Box") */}
                {isMegaMenuOpen && hasMore && (
                    <div className="absolute left-0 right-0 top-full mt-px bg-white border-b border-gray-200 shadow-xl py-6 animate-in slide-in-from-top-2 duration-200 z-50" ref={megaMenuRef}>
                        <div className="container mx-auto px-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">All Sections</h4>
                            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-3 gap-x-4">
                                {allCategories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`text-left text-sm font-medium transition-colors truncate
                                            ${selectedCategory === cat ? 'text-sky-600 font-bold' : 'text-gray-600 hover:text-gray-900 hover:underline'}
                                        `}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryStrip;