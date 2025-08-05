import React, { useState } from 'react';

const MarketSection = ({ title, children, isLoading = false, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200/80 last:border-b-0">
            <button
                className="w-full flex justify-between items-center py-3 px-1 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-gray-800">{title}</h4>
                    {isLoading && <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="pb-4 px-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MarketSection;