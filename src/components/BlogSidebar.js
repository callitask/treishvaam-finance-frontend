import React, { useState } from 'react';

const BlogSidebar = ({ categories, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, loadingCategories }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const allCategories = ['All', ...categories.map(cat => cat.name)];

    return (
        <aside className="lg:col-span-2 xl:col-span-2 order-1 lg:order-3 bg-white p-6 shadow-md mx-auto max-w-sm lg:max-w-none">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Finance <span className="text-sky-600">World</span></h1>
            <p className="text-sm text-gray-500 mb-6">Stay ahead with timely market developments.</p>
            <div className="flex flex-col gap-y-6">
                <div>
                    <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search Articles</label>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="e.g., 'Inflation'..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 text-base text-gray-700 bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <h3 className="block text-sm font-medium text-gray-700 mb-2">Categories</h3>
                    {loadingCategories ? (
                        <div className="space-y-2">
                            <div className="h-10 bg-gray-200 animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                type="button"
                                className="w-full px-4 py-2 text-left bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors duration-200 hover:bg-gray-50 text-sm font-medium text-gray-700 flex justify-between items-center"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {selectedCategory}
                                <svg className={`h-5 w-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute z-10 mt-2 w-full origin-top-right bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-100 ease-in-out">
                                    <div className="py-1">
                                        {allCategories.map(cat => (
                                            <div
                                                key={cat}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default BlogSidebar;