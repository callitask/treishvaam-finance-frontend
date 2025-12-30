import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWidgetData } from '../apiConfig';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import MarketHero from '../components/market-detail/MarketHero';
import MainChart from '../components/market-detail/MainChart';
import ComparisonCarousel from '../components/market-detail/ComparisonCarousel';
import DataSummary from '../components/market-detail/DataSummary';
import AboutAsset from '../components/market-detail/AboutAsset';
import DynamicMarketSummary from '../components/market/DynamicMarketSummary';

const MarketDetailPage = () => {
    const { ticker } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- PHASE 3: EDGE HYDRATION & NAVIGATION HANDLER ---
    useEffect(() => {
        // Reset state for navigation
        setError(null);

        const decodedTicker = decodeURIComponent(ticker);
        const globalState = typeof window !== 'undefined' ? window.__PRELOADED_STATE__ : null;

        // Hydration Check: Does preloaded data match the requested ticker?
        if (globalState && globalState.quoteData && globalState.quoteData.ticker === decodedTicker) {
            console.log("⚡ Market Data Hydrated from Edge");
            setData(globalState);
            setLoading(false);
            window.__PRELOADED_STATE__ = null; // Clean up
        } else {
            // Fallback Fetch
            console.log("🔄 Fetching Market Data...");
            setLoading(true);
            const fetchData = async () => {
                try {
                    const response = await getWidgetData(decodedTicker);
                    if (!response.data || !response.data.quoteData) {
                        throw new Error('No data returned for this asset.');
                    }
                    setData(response.data);
                } catch (e) {
                    console.error("Failed to fetch market detail data:", e);
                    setError(e.message || 'Could not load data for this asset.');
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [ticker]);

    const { quoteData, historicalData, peers } = data || {};
    const decodedTicker = decodeURIComponent(ticker);

    // Fallback title while loading
    const pageTitle = quoteData
        ? `Treishfin · Market · ${quoteData.name} (${quoteData.ticker})`
        : `Treishfin · Market · ${decodedTicker}`;

    const pageDescription = quoteData
        ? `Detailed financial analysis and live market data for ${quoteData.name} (${quoteData.ticker}). View charts, price history, and key statistics on Treishvaam Finance.`
        : "Real-time market data and analysis on Treishvaam Finance.";

    // --- ENTERPRISE SEO: Structured Data for Financial Product ---
    const generateFinancialSchema = (quote) => {
        if (!quote) return null;
        return {
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": quote.name,
            "tickerSymbol": quote.ticker,
            "exchangeTicker": quote.exchange || "NYSE",
            "description": pageDescription,
            "url": `https://treishfin.treishvaamgroup.com/market/${ticker}`,
            "image": quote.logoUrl || "https://treishfin.treishvaamgroup.com/logo.webp",
            "currentExchangeRate": {
                "@type": "UnitPriceSpecification",
                "price": quote.price,
                "priceCurrency": "USD"
            }
        };
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-500">
                <Loader2 size={48} className="animate-spin text-blue-600" />
                <span className="mt-4 text-lg">Loading market data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4 max-w-4xl text-center">
                <Link to="/" className="text-blue-600 hover:underline mb-4 inline-flex items-center">
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-gray-600">{error}</p>
            </div>
        );
    }

    const schema = generateFinancialSchema(quoteData);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`https://treishfin.treishvaamgroup.com/market/${ticker}`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                {/* Inject JSON-LD Schema */}
                {schema && (
                    <script type="application/ld+json">
                        {JSON.stringify(schema)}
                    </script>
                )}
            </Helmet>

            <div className="container mx-auto p-4 max-w-6xl font-sans">
                {/* --- Component 1: Dynamic Market Summary Bar --- */}
                <DynamicMarketSummary />

                {/* --- Component 2: Page Hero --- */}
                <MarketHero quote={quoteData} />

                {/* --- Component 3: Main Content Body --- */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* --- 4a. Left Column (Wide) --- */}
                    <div className="md:col-span-2 flex flex-col gap-6">

                        {/* Module 1: Interactive Chart */}
                        <MainChart history={historicalData} quote={quoteData} />

                        {/* Module 2: Comparison Carousel */}
                        {peers && peers.length > 0 && (
                            <ComparisonCarousel peers={peers} />
                        )}

                        {/* Module 3: About */}
                        {quoteData.description && (
                            <AboutAsset quote={quoteData} />
                        )}
                    </div>

                    {/* --- 4b. Right Column (Narrow) --- */}
                    <div className="md:col-span-1 flex flex-col gap-6">

                        {/* Module 1: Data Summary Card */}
                        <DataSummary quote={quoteData} />

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketDetailPage;