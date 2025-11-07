import React, { useState } from 'react';
import MarketChart from './MarketChart';

// UPDATED: Using ETF equivalents directly as requested
const indices = [
    { symbol: 'SPY', name: 'S&P 500' },
    { symbol: 'DIA', name: 'Dow Jones' },
    { symbol: 'QQQ', name: 'NASDAQ' },
];

const IndexCharts = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const activeChart = indices[activeIndex];

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm rounded-md overflow-hidden">
            <div className="p-3 border-b border-gray-200/90">
                <h2 className="font-bold text-base text-gray-800">US Indices (ETFs)</h2>
                <div className="mt-2 flex items-center border border-gray-200 rounded-md p-0.5">
                    {indices.map((index, i) => (
                        <button
                            key={index.symbol}
                            onClick={() => setActiveIndex(i)}
                            className={`flex-1 text-xs font-semibold py-1.5 px-2 transition-colors duration-200 rounded-sm ${activeIndex === i
                                    ? 'bg-sky-600 text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {index.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-[250px] flex items-center justify-center">
                {/* Changed h-auto to h-[250px] to match previous design stability */}
                {activeChart && (
                    <MarketChart
                        ticker={activeChart.symbol}
                        chartTitle={activeChart.name}
                    />
                )}
            </div>
        </div>
    );
};

export default IndexCharts;