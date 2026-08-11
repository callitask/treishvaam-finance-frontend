/**
 * AI-CONTEXT:
 * Purpose: Input component for adding tags to a blog post.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` and `sky-*` palette 
 * with `slate-*`, updated input and button to `h-8` with `text-[11px]`, tightened tag pill padding.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
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
            <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(tag => (
                    <div key={tag} className="bg-slate-200/60 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center border border-slate-200">
                        <span>{tag}</span>
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-slate-500 hover:text-red-600 font-bold leading-none">&times;</button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag"
                    className="w-full h-8 px-2 border border-slate-200 rounded text-[11px] focus:ring-1 focus:ring-sky-500 outline-none text-slate-800"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="h-8 px-3 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold rounded hover:bg-slate-200 transition-colors"
                >
                    Add
                </button>
            </div>
        </div>
    );
};

export default TagsInput;