// src/components/MarketMap.js
import React, { useState, useEffect } from 'react';
// UPDATED: Import the correct API functions from your apiConfig.js
import { getTopGainers, getTopLosers, getMostActive } from '../../apiConfig'; // Adjust the path if necessary
import MarketCard from './market/MarketCard';

// Skeleton Loader Component (no changes needed here)
const CardSkeleton = () => (
    <div className="bg-white border border-gray-200/90 shadow-sm p-3 animate-pulse">
        <div className="h-5 bg-gray-200 w-1/2 mb-4"></div>
        <div className="space-y-3">
            <div className="h-3 bg-gray-200 w-full"></div>
            <div className="h-3 bg-gray-200 w-full"></div>
            <div className="h-3 bg-gray-200 w-5/6"></div>
        </div>
    </div>
);

const MarketMap = () => {
    // UPDATED: State is now simpler, just three separate arrays.
    const [topGainers, setTopGainers] = useState([]);
    const [topLosers, setTopLosers] = useState([]);
    const [mostActive, setMostActive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // UPDATED: This function now calls YOUR backend, not Alpha Vantage.
        const fetchMovers = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Use Promise.all to fetch all data concurrently for better performance
                const [gainers, losers, active] = await Promise.all([
                    getTopGainers(),
                    getTopLosers(),
                    getMostActive()
                ]);

                // Set the state with the data from your backend
                setTopGainers(gainers || []);
                setTopLosers(losers || []);
                setMostActive(active || []);

            } catch (err) {
                console.error("Failed to fetch market movers:", err);
                setError("Could not fetch market data from the server.");
            } finally {
                setLoading(false);
            }
        };

        fetchMovers();
    }, []); // The empty dependency array ensures this runs only once on mount

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-base border-b pb-2">Market Movers</h3>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }
    
    if (error) {
        return (
            <div>
                <h3 className="font-bold text-base border-b pb-2 mb-4">Market Movers</h3>
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
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
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <h3 className="font-bold text-base border-b pb-2">Market Movers</h3>
             {/* UPDATED: Pass the correct state variables to each card */}
             <MarketCard 
                 title="Most Active" 
                 data={mostActive}
                 cardType="active" 
             />
             <MarketCard 
                 title="Top Gainers" 
                 data={topGainers}
                 cardType="gainer"
             />
             <MarketCard 
                 title="Top Losers" 
                 data={topLosers}
                 cardType="loser"
             />
        </div>
    );
};

export default MarketMap;