import React from 'react';
import TopMoversCard from './TopMoversCard';
import { getMostActive, getTopGainers, getTopLosers } from '../../apiConfig';

const MarketMovers = () => {
    return (
        <div className="space-y-4">
            <h2 className="font-bold text-xl border-b pb-2 pt-4">Market Movers</h2>
            <TopMoversCard title="Most Active" fetchData={getMostActive} type="active" />
            <TopMoversCard title="Top Gainers" fetchData={getTopGainers} type="gainer" />
            <TopMoversCard title="Top Losers" fetchData={getTopLosers} type="loser" />
        </div>
    );
};

export default MarketMovers;