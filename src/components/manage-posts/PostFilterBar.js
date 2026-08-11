/**
 * AI-CONTEXT:
 * Purpose: Search and filter controls for the manage posts data grid.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`, 
 * changed `rounded-xl` to `rounded`, tightened inputs to `h-8` with `text-[11px]`, and removed soft shadows.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaSearch, FaFilter, FaTrash } from 'react-icons/fa';

const PostFilterBar = ({
    searchQuery, setSearchQuery,
    categories, selectedCategory, setSelectedCategory,
    selectedCount, onBulkDelete }) => {
    return (
        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col md:flex-row gap-2 items-center justify-between mb-4">
            {/* LEFT: Search & Filters */}
            <div className="flex flex-1 gap-2 w-full md:w-auto">
                <div className="relative flex-1 max-w-sm">
                    <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <input
                        type="text"
                        placeholder="Search posts by title or author..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 h-8 border border-slate-200 rounded text-[11px] bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-slate-700 placeholder-slate-400"
                    />
                </div>
                <div className="relative min-w-[140px]">
                    <FaFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={10} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-7 pr-3 h-8 border border-slate-200 rounded text-[11px] bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none appearance-none cursor-pointer text-slate-700"
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
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/50 px-2 py-1 rounded">
                        {selectedCount} selected
                    </span>
                    <button
                        onClick={onBulkDelete}
                        className="flex items-center gap-1.5 px-3 h-8 bg-white text-red-600 rounded text-[11px] font-bold hover:bg-red-50 transition-colors border border-red-200 shadow-sm"
                    >
                        <FaTrash size={10} /> Delete Selection
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostFilterBar;