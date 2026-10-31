import React, { useState, useEffect } from 'react';
import { getQuotesBatch } from '../../apiConfig';

// A lightweight skeleton loader for each row
const RowSkeleton = () => (
    <div className="flex justify-between items-center py-2 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    </div>
);

const IndianMarketWidget = () => {
    // State to hold our stock data, loading, and error status
    const [marketData, setMarketData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // List of key Indian stocks to track.
    const symbolsToTrack = ['RELIANCE.BSE', 'TCS.BSE', 'HDFCBANK.BSE', 'INFY.BSE'];

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await getQuotesBatch(symbolsToTrack);
                const data = (response.data || []).filter(Boolean);
                if (data.length === 0) {
                    setError('Data currently unavailable.');
                }
                setMarketData(data);
            } catch (err) {
                console.error("Failed to fetch Indian market data:", err);
                setError('Data currently unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, []); // Empty dependency array means this runs once on mount

    const renderRow = (stock) => {
        const price = parseFloat(stock.price ?? stock['05. price'] ?? 0).toFixed(2);
        const change = parseFloat(stock.change ?? stock['09. change'] ?? 0);
        const changePercent = parseFloat(String(stock.changePercent ?? stock['10. change percent'] ?? '0').replace('%', '')).toFixed(2);
        const isPositive = change >= 0;
        const symbol = stock.symbol ?? stock['01. symbol'] ?? '';

        return (
            <div key={symbol} className="flex justify-between items-center text-sm border-b border-gray-200/80 py-2.5 last:border-b-0">
                <span className="font-semibold text-gray-800 truncate pr-2">{String(symbol).replace('.BSE', '')}</span>
                <div className="flex flex-col items-end">
                    <span className="font-medium text-gray-900">{price}</span>
                    <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent}%)
                    </span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div>
                <h3 className="font-bold text-lg border-b pb-2 mb-2">Indian Market Snapshot</h3>
                <div className="space-y-2 py-2">
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                 <h3 className="font-bold text-lg border-b pb-2 mb-2">Indian Market Snapshot</h3>
                 <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-bold text-lg border-b pb-2 mb-1">Indian Market Snapshot</h3>
            <div className="flex flex-col">
                {marketData.length > 0 ? marketData.map(renderRow) : <p className="text-sm text-gray-500 py-4">Data currently unavailable.</p>}
            </div>
        </div>
    );
};

export default IndianMarketWidget;