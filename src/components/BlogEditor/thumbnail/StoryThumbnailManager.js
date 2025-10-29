import React, { useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableThumbnail from './DraggableThumbnail';

const StoryThumbnailManager = ({ thumbnails, setThumbnails, onUploadClick, onAddFromPostClick }) => {
    const moveThumbnail = useCallback((dragIndex, hoverIndex) => {
        setThumbnails(prev => {
            const newThumbnails = [...prev];
            const [draggedItem] = newThumbnails.splice(dragIndex, 1);
            newThumbnails.splice(hoverIndex, 0, draggedItem);
            return newThumbnails;
        });
    }, [setThumbnails]);

    const removeThumbnail = (index) => setThumbnails(prev => prev.filter((_, i) => i !== index));

    const handleAltTextChange = (index, text) => {
        setThumbnails(prev => {
            const newThumbnails = [...prev];
            newThumbnails[index].altText = text;
            return newThumbnails;
        });
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {thumbnails.length > 0 ? thumbnails.map((thumb, index) => (
                        <DraggableThumbnail key={thumb.id || index} index={index} id={thumb.id || index} thumbnail={thumb} moveThumbnail={moveThumbnail} onRemove={removeThumbnail} onAltTextChange={handleAltTextChange} />
                    )) : (<p className="text-center text-gray-500 text-sm py-4">No story thumbnails yet.</p>)}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button type="button" onClick={onUploadClick} className="flex-1 flex items-center justify-center gap-2 text-sm p-2 rounded-lg font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Upload New
                    </button>
                    <button type="button" onClick={onAddFromPostClick} className="flex-1 flex items-center justify-center gap-2 text-sm p-2 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Add from Post
                    </button>
                </div>
            </div>
        </DndProvider>
    );
};

export default StoryThumbnailManager;
