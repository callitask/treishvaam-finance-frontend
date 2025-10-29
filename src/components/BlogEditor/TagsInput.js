import React, { useState } from 'react';

const TagsInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');
    const addTag = () => {
        const newTag = inputValue.trim().replace(/,/g, '');
        if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
        setInputValue('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };
    const removeTag = (tagToRemove) => setTags(tags.filter(tag => tag !== tagToRemove));

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <div key={tag} className="bg-sky-100 text-sky-800 text-sm font-semibold px-2 py-1 rounded-full flex items-center">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-sky-600 hover:text-sky-900">&times;</button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Add a tag" className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-sky-200" />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700">Add</button>
            </div>
        </div>
    );
};

export default TagsInput;
