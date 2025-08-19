import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    // Note: Using the .BSE suffix for stocks listed on the Bombay Stock Exchange,
    // as this is a common format for Alpha Vantage.
    const symbolsToTrack = ['RELIANCE.BSE', 'TCS.BSE', 'HDFCBANK.BSE', 'INFY.BSE'];

    useEffect(() => {
        const fetchStockData = async () => {
            setLoading(true);
            setError(null);
            
            const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
            if (!apiKey) {
                setError('API Key is missing.');
                setLoading(false);
                return;
            }

            // Create an array of promises, one for each API call
            const promises = symbolsToTrack.map(symbol =>
                axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
            );

            try {
                const responses = await Promise.all(promises);
                const data = responses.map(response => {
                    // Check for API call limits or errors in each response
                    if (response.data['Note']) {
                        throw new Error('API call limit reached. Please wait a minute and try again.');
                    }
                    if (!response.data['Global Quote'] || Object.keys(response.data['Global Quote']).length === 0) {
                        // This handles cases where a symbol might not be found
                        return null; 
                    }
                    return response.data['Global Quote'];
                }).filter(Boolean); // Filter out any null results

                if (data.length === 0 && responses.length > 0) {
                    setError('Could not fetch data. The API may be temporarily unavailable.');
                }
                
                setMarketData(data);

            } catch (err) {
                console.error("Failed to fetch Indian market data:", err);
                setError(err.message || "An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, []); // Empty dependency array means this runs once on mount

    const renderRow = (stock) => {
        const price = parseFloat(stock['05. price']).toFixed(2);
        const change = parseFloat(stock['09. change']);
        const changePercent = parseFloat(stock['10. change percent'].replace('%', '')).toFixed(2);
        const isPositive = change >= 0;

        return (
            <div key={stock['01. symbol']} className="flex justify-between items-center text-sm border-b border-gray-200/80 py-2.5 last:border-b-0">
                <span className="font-semibold text-gray-800 truncate pr-2">{stock['01. symbol'].replace('.BSE', '')}</span>
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
