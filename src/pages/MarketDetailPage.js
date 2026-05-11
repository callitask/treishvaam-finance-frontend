"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMarketData, getQuoteData } from '../apiConfig';
import { Helmet } from 'react-helmet-async';

import MarketHero from '../components/market-detail/MarketHero';
import MainChart from '../components/market-detail/MainChart';
import DataSummary from '../components/market-detail/DataSummary';
import AboutAsset from '../components/market-detail/AboutAsset';
import ComparisonCarousel from '../components/market-detail/ComparisonCarousel';

/**
 * AI-CONTEXT:
 * Purpose: Market detail page for specific tickers.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/navigation.
 */
const MarketDetailPage = () => {
    const params = useParams();
    // In Next.js, dynamic routes might return encoded values depending on the request path
    const rawTicker = params?.ticker;
    const ticker = rawTicker ? decodeURIComponent(rawTicker) : null;

    const [marketData, setMarketData] = useState(null);
    const [quoteData, setQuoteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticker) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [marketRes, quoteRes] = await Promise.all([
                    getMarketData(ticker).catch(e => { console.warn("Market static data fetch failed", e); return { data: null }; }),
                    getQuoteData(ticker).catch(e => { console.warn("Live quote fetch failed", e); return { data: null }; })
                ]);

                if (!marketRes.data && !quoteRes.data) {
                    throw new Error("Asset not found or no data available.");
                }

                setMarketData(marketRes.data);
                setQuoteData(quoteRes.data);

            } catch (err) {
                console.error("Failed to load market details", err);
                setError(err.message || "Failed to load market data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(async () => {
            try {
                const res = await getQuoteData(ticker);
                if (res.data) setQuoteData(res.data);
            } catch (e) {
                // Silent fail for polling
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [ticker]);

    if (loading) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-slate-50">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Loading Market Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center bg-slate-50 px-4 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-3">Asset Not Found</h2>
                <p className="mb-6 text-slate-600">{error}</p>
                <button onClick={() => window.history.back()} className="text-sky-600 font-bold hover:underline">
                    &larr; Go Back
                </button>
            </div>
        );
    }

    const title = quoteData?.name || marketData?.name || ticker;

    return (
        <div className="bg-slate-50 min-h-screen pb-12">
            <Helmet>
                <title>{`${title} (${ticker}) | Treishvaam Finance`}</title>
                <meta name="description" content={`Live quote, historical chart, and data for ${title} (${ticker}).`} />
            </Helmet>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 max-w-[1400px]">
                <MarketHero ticker={ticker} quoteData={quoteData} marketData={marketData} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 space-y-6">
                        <MainChart ticker={ticker} quoteData={quoteData} />
                        <AboutAsset marketData={marketData} quoteData={quoteData} />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <DataSummary quoteData={quoteData} marketData={marketData} />
                        <ComparisonCarousel peers={marketData?.peers} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetailPage;