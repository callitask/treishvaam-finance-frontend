import React from 'react';
import TagsInput from './TagsInput';

const LayoutPanel = ({ layoutStyle, onLayoutStyleChange, tags, onTagsChange }) => {
    return (
        <>
            <div>
                <label htmlFor="layoutStyle" className="block text-gray-700 font-semibold mb-2">Layout Style</label>
                <select id="layoutStyle" value={layoutStyle} onChange={onLayoutStyleChange} className="w-full p-2 border border-gray-300 rounded">
                    <option value="DEFAULT">Default (Masonry)</option>
                    <option value="BANNER">Banner</option>
                    <option value="MULTI_COLUMN_2">2 Column Row</option>
                    <option value="MULTI_COLUMN_3">3 Column Row</option>
                    <option value="MULTI_COLUMN_4">4 Column Row</option>
                    <option value="MULTI_COLUMN_5">5 Column Row</option>
                    <option value="MULTI_COLUMN_6">6 Column Row</option>
                </select>
            </div>

            <div>
                <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                <TagsInput tags={tags} setTags={onTagsChange} />
            </div>
        </>
    );
};

export default LayoutPanel;
