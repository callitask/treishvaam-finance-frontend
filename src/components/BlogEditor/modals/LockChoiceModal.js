import React from 'react';

const LockChoiceModal = ({ isOpen, onChoice }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-4">Square Image Detected</h3>
                <p className="text-gray-600 mb-6">For subsequent images in this story, how should they be cropped?</p>
                <div className="flex justify-center gap-4 mt-4">
                    <button onClick={() => onChoice('landscape')} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Lock Height (Landscape Style)</button>
                    <button onClick={() => onChoice('portrait')} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">Lock Width (Portrait Style)</button>
                </div>
            </div>
        </div>
    )
}

export default LockChoiceModal;
