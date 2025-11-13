import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWidgetData } from '../apiConfig';
import { ArrowLeft, Loader2 } from 'lucide-react';

// --- FIXED IMPORT PATHS ---
// Changed paths to go UP one level from 'src/pages' to 'src/'
// then DOWN to 'src/components/market-detail/'
import MarketHero from '../components/market-detail/MarketHero';
import MainChart from '../components/market-detail/MainChart';
import ComparisonCarousel from '../components/market-detail/ComparisonCarousel';
import DataSummary from '../components/market-detail/DataSummary';
import AboutAsset from '../components/market-detail/AboutAsset';

const MarketDetailPage = () => {
    const { ticker } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setData(null);
            try {
                const response = await getWidgetData(decodeURIComponent(ticker));
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
    }, [ticker]);

    const { quoteData, historicalData, peers } = data || {};

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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 max-w-6xl font-sans">

                {/* --- Component 2: Page Hero --- */}
                <MarketHero quote={quoteData} />

                {/* --- Component 3: Main Content Body (Asymmetric 2-Column Layout) --- */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* --- 4a. Left Column (Wide) --- */}
                    <div className="md:col-span-2 flex flex-col gap-6">

                        {/* Module 1: Interactive Chart */}
                        <MainChart history={historicalData} quote={quoteData} />

                        {/* Module 2: Comparison Carousel */}
                        {peers && peers.length > 0 && (
                            <ComparisonCarousel peers={peers} />
                        )}

                        {/* Module 3: About (Moved to Left Col) */}
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