import React from 'react';
import { FaSearch, FaFilter, FaTrash } from 'react-icons/fa';

const PostFilterBar = ({
    searchQuery, setSearchQuery,
    categories, selectedCategory, setSelectedCategory,
    selectedCount, onBulkDelete
}) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6">

            {/* LEFT: Search & Filters */}
            <div className="flex flex-1 gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                    />
                </div>

                <div className="relative min-w-[160px]">
                    <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RIGHT: Bulk Actions (Conditional) */}
            {selectedCount > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-md">
                        {selectedCount} selected
                    </span>
                    <button
                        onClick={onBulkDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors border border-red-200"
                    >
                        <FaTrash size={12} /> Delete Selection
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostFilterBar;