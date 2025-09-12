import React from 'react';
import MarketChart from './MarketChart';

// Define the US indices to display
const indices = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^DJI', name: 'Dow Jones Industrial Average' },
    { symbol: '^IXIC', name: 'NASDAQ Composite' },
];

const IndexCharts = () => {
    return (
        <div className="space-y-4">
            <h2 className="font-bold text-xl border-b pb-2 pt-4">US Indices</h2>
            {indices.map((index) => (
                <div key={index.symbol} className="bg-white border border-gray-200/90 shadow-sm">
                    {/* The MarketChart component is reused here for each index */}
                    <MarketChart 
                        ticker={index.symbol} 
                        chartTitle={index.name} 
                    />
                </div>
            ))}
        </div>
    );
};

export default IndexCharts;