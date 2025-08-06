import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarketCard from './market/MarketCard';

// Skeleton Loader Component
const CardSkeleton = () => (
    <div className="bg-white border border-gray-200/90 rounded-lg shadow-sm p-3 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-full mt-4"></div>
    </div>
);

const MarketMap = () => {
    const [marketData, setMarketData] = useState({ top_gainers: [], top_losers: [], most_actively_traded: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovers = async () => {
            setLoading(true);
            setError(null);
            
            // It's critical to use the environment variable for the API key
            const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
            if (!apiKey) {
                setError('API Key is missing. Please configure REACT_APP_ALPHA_VANTAGE_API_KEY in your .env file.');
                setLoading(false);
                return;
            }

            const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;

            try {
                const response = await axios.get(url);
                // The free API has a very low rate limit and might return a note instead of data.
                if (response.data['Note']) {
                    setError('API call limit reached. Please wait and try again later.');
                    // Set empty arrays to prevent crashes
                     setMarketData({ top_gainers: [], top_losers: [], most_actively_traded: [] });
                } else if (response.data['Information']) {
                    setError('API returned an error. Please check your API key or endpoint.');
                    setMarketData({ top_gainers: [], top_losers: [], most_actively_traded: [] });
                }
                else {
                    setMarketData({
                        top_gainers: response.data.top_gainers || [],
                        top_losers: response.data.top_losers || [],
                        most_actively_traded: response.data.most_actively_traded || [],
                    });
                }
            } catch (err) {
                console.error("Failed to fetch market movers:", err);
                setError("Could not fetch Market Movers data. The external API might be down.");
                setMarketData({ top_gainers: [], top_losers: [], most_actively_traded: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchMovers();
    }, []);

    if (loading) {
        return (
            <div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Market Map</h3>
                <div className="grid grid-cols-1 gap-6">
                    <CardSkeleton />
                </div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2 mt-8">Market War</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Section 1: Market Map */}
            <div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Market Map</h3>
                <div className="grid grid-cols-1 gap-6">
                    <MarketCard 
                        title="Stock Action" 
                        data={marketData.most_actively_traded}
                        cardType="active" 
                    />
                </div>
            </div>

            {/* Section 2: Market War */}
            <div>
                <h3 className="font-bold text-lg mb-4 border-b pb-2">Market War</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MarketCard 
                        title="Top Gainers" 
                        data={marketData.top_gainers}
                        cardType="gainer"
                    />
                    <MarketCard 
                        title="Top Losers" 
                        data={marketData.top_losers}
                        cardType="loser"
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketMap;