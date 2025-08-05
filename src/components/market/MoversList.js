import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MoversList = () => {
    const [movers, setMovers] = useState({ top_gainers: [], top_losers: [], most_actively_traded: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovers = async () => {
            setLoading(true);
            const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
            const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;
            try {
                const response = await axios.get(url);
                if (response.data['Note']) {
                    setError('API limit reached.');
                }
                setMovers({
                    top_gainers: response.data.top_gainers || [],
                    top_losers: response.data.top_losers || [],
                    most_actively_traded: response.data.most_actively_traded || [],
                });
            } catch (err) {
                setError("Could not fetch Market Movers.");
            }
            setLoading(false);
        };
        fetchMovers();
    }, []);

    const renderList = (list) => {
        if (!list || list.length === 0) return <p className="text-xs text-gray-500 px-1 py-4 text-center">No data.</p>;
        return list.slice(0, 10).map((item) => {
            const isPositive = parseFloat(item.change_amount) >= 0;
            const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
            return (
                <div key={item.ticker} className="flex justify-between items-center text-sm py-1.5 px-1">
                    <span className="font-semibold text-gray-800 truncate pr-2">{item.ticker}</span>
                    <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</span>
                        <span className={`font-bold w-20 text-right ${changeColor}`}>{item.change_percentage}</span>
                    </div>
                </div>
            );
        });
    };

    const renderSkeleton = () => (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded-md animate-pulse"></div>)}</div>
    );

    if (loading) return <div className="space-y-4"><div><h5 className="font-semibold text-sm text-gray-700 mb-1">Top Gainers</h5>{renderSkeleton()}</div><div><h5 className="font-semibold text-sm text-gray-700 mb-1">Top Losers</h5>{renderSkeleton()}</div><div><h5 className="font-semibold text-sm text-gray-700 mb-1">Most Active</h5>{renderSkeleton()}</div></div>;
    if (error) return <p className="text-xs text-red-500 p-2">{error}</p>;

    return (
        <div className="space-y-4">
            <div><h5 className="font-semibold text-sm text-gray-700 mb-1">Top Gainers</h5><div className="border rounded-md max-h-60 overflow-y-auto bg-white/50">{renderList(movers.top_gainers)}</div></div>
            <div><h5 className="font-semibold text-sm text-gray-700 mb-1">Top Losers</h5><div className="border rounded-md max-h-60 overflow-y-auto bg-white/50">{renderList(movers.top_losers)}</div></div>
            <div><h5 className="font-semibold text-sm text-gray-700 mb-1">Most Active</h5><div className="border rounded-md max-h-60 overflow-y-auto bg-white/50">{renderList(movers.most_actively_traded)}</div></div>
        </div>
    );
};

export default MoversList;