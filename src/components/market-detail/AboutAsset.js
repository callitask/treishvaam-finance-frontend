import React, { useState } from 'react';

const AboutAsset = ({ quote }) => {
    const [showFullDesc, setShowFullDesc] = useState(false);

    const description = quote.description || '';
    const isLongDesc = description.length > 400;
    const displayedDesc = showFullDesc ? description : description.substring(0, 400);

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About {quote.name}</h2>

            {/* Using whitespace-pre-line to respect newlines from Wikipedia */}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {displayedDesc}{!showFullDesc && isLongDesc ? '...' : ''}
            </p>

            {isLongDesc && (
                <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-sm font-semibold text-blue-600 hover:underline mt-2"
                >
                    {showFullDesc ? 'Read Less' : 'Read More'}
                </button>
            )}

            <p className="text-xs text-gray-400 mt-4">
                Source: Wikipedia
            </p>
        </div>
    );
};

export default AboutAsset;