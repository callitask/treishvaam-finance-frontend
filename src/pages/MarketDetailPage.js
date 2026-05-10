"use client";
/**
 * AI-CONTEXT:
 * Purpose: Legacy CRA page for displaying detailed market data.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Added `"use client";` to bypass Next.js Server Component restrictions on hooks (useState, useEffect).
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWidgetData } from '../apiConfig';
import { ArrowLeft, Loader2 } from 'lucide-react';
import MarketHero from '../components/market-detail/MarketHero';
import MainChart from '../components/market-detail/MainChart';
import DataSummary from '../components/market-detail/DataSummary';
import AboutAsset from '../components/market-detail/AboutAsset';
import ComparisonCarousel from '../components/market-detail/ComparisonCarousel';

const MarketDetailPage = () => {
    const { ticker } = useParams();
    const [marketData, setMarketData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchMarketData = async () => {
            if (!ticker) return;
            setLoading(true);
            setError(null);
            try {
                // We use the new backend endpoint that aggregates Quote + History + Profile
                const decodedTicker = decodeURIComponent(ticker);
                const response = await getWidgetData(decodedTicker);

                if (isMounted) {
                    setMarketData(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch market data:", err);
                if (isMounted) {
                    setError("Failed to load market data. Please try again later.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMarketData();

        return () => {
            isMounted = false;
        };
    }, [ticker]);

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Compiling Market Data...</p>
                </div>
            </div>
        );
    }

    if (error || !marketData) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md text-center border border-red-200 dark:border-red-800">
                    <h2 className="text-xl font-bold mb-2">Data Unavailable</h2>
                    <p className="mb-6">{error || "The requested market data could not be found."}</p>
                    <Link to="/" className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold">
                        <ArrowLeft size={16} className="mr-2" /> Return to Markets
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-6">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. Header (Hero) */}
                <MarketHero quote={marketData.quote} />

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    {/* Left Column (Chart & About) */}
                    <div className="lg:col-span-2 space-y-6">
                        <MainChart
                            quote={marketData.quote}
                            historicalData={marketData.historicalData}
                        />
                        <AboutAsset profile={marketData.profile} />
                    </div>

                    {/* Right Column (Data Summary) */}
                    <div className="space-y-6">
                        <DataSummary quote={marketData.quote} />
                    </div>
                </div>

                {/* 3. Bottom Strip (Comparisons/Related) */}
                {marketData.relatedAssets && marketData.relatedAssets.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Related Assets</h3>
                        <ComparisonCarousel relatedAssets={marketData.relatedAssets} />
                    </div>
                )}

            </div>
        </div>
    );
};

export default MarketDetailPage;