import React, { useState } from 'react';
import MarketChart from './MarketChart';

// Using the exact array from your working version
const indices = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^DJI', name: 'Dow Jones Industrial Average' },
    { symbol: '^IXIC', name: 'NASDAQ Composite' },
];

const IndexCharts = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const activeChart = indices[activeIndex];

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm rounded-md overflow-hidden">
            <div className="p-3 border-b border-gray-200/90">
                <h2 className="font-bold text-base text-gray-800">US Indices</h2>
                <div className="mt-2 flex items-center border border-gray-200 rounded-md p-0.5">
                    {indices.map((index, i) => (
                        <button
                            key={index.symbol}
                            onClick={() => setActiveIndex(i)}
                            // Display shorter names on tabs for better fit
                            className={`flex-1 text-xs font-semibold py-1.5 px-2 transition-colors duration-200 rounded-sm ${
                                activeIndex === i
                                    ? 'bg-sky-600 text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {index.name.includes('S&P') ? 'S&P 500' : index.name.includes('Dow Jones') ? 'Dow Jones' : 'NASDAQ'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[250px] flex items-center justify-center">
                {activeChart && (
                    <MarketChart
                        // NOTE: The problematic 'key' prop has been removed.
                        ticker={activeChart.symbol}
                        chartTitle={activeChart.name}
                    />
                )}
            </div>
        </div>
    );
};

export default IndexCharts;