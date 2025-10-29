import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const DraggableThumbnail = ({ id, thumbnail, index, moveThumbnail, onRemove, onAltTextChange }) => {
    const ref = useRef(null);
    const [, drop] = useDrop({
        accept: 'thumbnail',
        hover(item) {
            if (!ref.current || item.index === index) return;
            moveThumbnail(item.index, index);
            item.index = index;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'thumbnail',
        item: { type: 'thumbnail', id, index },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));
    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} className="p-2 border rounded-lg bg-white flex items-start gap-3">
            <img src={thumbnail.preview} alt="preview" className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
            <div className="flex-grow">
                <input type="text" value={thumbnail.altText || ''} onChange={(e) => onAltTextChange(index, e.target.value)} placeholder="Alt text" className="w-full p-2 text-sm border border-gray-300 rounded mb-2" />
                <button type="button" onClick={() => onRemove(index)} className="text-xs text-red-600 hover:underline">Remove</button>
            </div>
        </div>
    );
};

export default DraggableThumbnail;
