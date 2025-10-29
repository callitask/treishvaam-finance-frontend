import React from 'react';
import IndexCharts from '../market/IndexCharts';
import MarketMovers from '../market/MarketMovers';

const MarketSidebar = () => {
    return (
        // This is the right-hand sidebar for DESKTOP only.
        <div className="sticky top-[80px] space-y-6">
            <div className="min-h-[350px]">
                <IndexCharts />
            </div>
            <div className="min-h-[650px]">
                <MarketMovers />
            </div>
        </div>
    );
};

export default MarketSidebar;
