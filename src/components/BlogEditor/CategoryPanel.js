import React from 'react';

const CategoryPanel = ({
    selectedCategory,
    onCategoryChange,
    allCategories,
    showNewCategoryInput,
    onShowNewCategoryToggle,
    newCategoryName,
    onNewCategoryNameChange,
    onAddNewCategory
}) => {
    return (
        <div>
            <label htmlFor="category" className="block text-gray-700 font-semibold mb-2">Category</label>
            <div className="flex items-center gap-2">
                <select
                    id="category"
                    value={selectedCategory ? selectedCategory.name : ''}
                    onChange={e => {
                        const cat = allCategories.find(c => c.name === e.target.value);
                        onCategoryChange(cat);
                    }}
                    className="w-full p-2 border border-gray-300 rounded"
                >
                    <option value="">Select a category</option>
                    {allCategories && allCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onShowNewCategoryToggle}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300 text-lg font-bold"
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
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                        type="button"
                        onClick={onAddNewCategory}
                        className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                    >
                        Add
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryPanel;
