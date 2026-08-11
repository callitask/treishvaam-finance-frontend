/**
 * AI-CONTEXT:
 * Purpose: Category selection and creation panel for the Blog Editor.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * updated inputs and selects to `text-[11px]` and `h-8`, and standardized buttons to `bg-slate-900`/`bg-slate-100`.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';

const CategoryPanel = ({
    selectedCategory,
    onCategoryChange,
    allCategories,
    showNewCategoryInput,
    onShowNewCategoryToggle,
    newCategoryName,
    onNewCategoryNameChange,
    onAddNewCategory }) => {
    return (
        <div className="space-y-2">
            <label htmlFor="category" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Category</label>
            <div className="flex items-center gap-2">
                <select
                    id="category"
                    value={selectedCategory ? selectedCategory.name : ''}
                    onChange={e => {
                        const cat = allCategories.find(c => c.name === e.target.value);
                        onCategoryChange(cat);
                    }}
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                >
                    <option value="">Select a category</option>
                    {allCategories && allCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onShowNewCategoryToggle}
                    className="h-8 px-3 bg-slate-100 border border-slate-200 text-slate-700 rounded hover:bg-slate-200 text-xs font-bold transition-colors"
                    title="Add Category"
                >
                    +
                </button>
            </div>
            {showNewCategoryInput && (
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => onNewCategoryNameChange(e.target.value)}
                        placeholder="New category name"
                        className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] bg-white text-slate-800 focus:ring-1 focus:ring-sky-500 outline-none"
                    />
                    <button
                        type="button"
                        onClick={onAddNewCategory}
                        className="h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded transition-colors"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryPanel;