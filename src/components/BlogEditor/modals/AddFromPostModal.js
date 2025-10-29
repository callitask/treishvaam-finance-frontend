import React, { useState } from 'react';

const AddFromPostModal = ({ images, isOpen, onClose, onSelect }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    if (!isOpen) return null;
    const toggleSelection = (url) => setSelectedImages(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full">
                <h3 className="text-xl font-bold mb-4">Select Images from Post</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
                    {images.map((url, index) => (
                        <div key={index} onClick={() => toggleSelection(url)} className={`relative rounded-lg overflow-hidden cursor-pointer border-4 ${selectedImages.includes(url) ? 'border-sky-500' : 'border-transparent'}`}>
                            <img src={url} alt={`Post content ${index + 1}`} className="w-full h-full object-cover" />
                            {selectedImages.includes(url) && (<div className="absolute inset-0 bg-sky-500 bg-opacity-50 flex items-center justify-center text-white text-2xl">✓</div>)}
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                    <button onClick={() => { onSelect(selectedImages); setSelectedImages([]); }} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Add Selected</button>
                </div>
            </div>
        </div>
    );
};

export default AddFromPostModal;
