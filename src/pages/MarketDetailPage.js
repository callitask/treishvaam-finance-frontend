import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getWidgetData } from '../apiConfig';
import MarketChart from '../components/market/MarketChart'; // Using the correct path
import { TrendingUp, TrendingDown, ArrowLeft, Share2 } from 'lucide-react';

const timeframes = [
    { label: '1D', points: 1 }, // Note: 1D is hard to show without intraday data, but we'll filter
    { label: '5D', points: 5 },
    { label: '1M', points: 22 },
    { label: '6M', points: 126 },
    { label: 'YTD', points: 'YTD' },
    { label: '1Y', points: 252 },
    { label: '5Y', points: 1260 },
    { label: 'Max', points: 99999 },
];

/**
 * Formats numbers into compact, readable strings (e.g., 2.5T, 100.2M, 1.5K).
 * Handles currency formatting and large non-currency numbers.
 */
const formatNumber = (num, style = 'decimal', currency = null) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';

    const numAbs = Math.abs(num);
    let suffix = '';
    let value = num;

    if (style === 'compact') {
        if (numAbs >= 1e12) {
            suffix = 'T';
            value = num / 1e12;
        } else if (numAbs >= 1e9) {
            suffix = 'B';
            value = num / 1e9;
        } else if (numAbs >= 1e6) {
            suffix = 'M';
            value = num / 1e6;
        } else if (numAbs >= 1e3) {
            suffix = 'K';
            value = num / 1e3;
        }
    }

    let options = {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    };

    if (style === 'currency' && currency) {
        options.style = 'currency';
        options.currency = currency;
    }

    // For very large prices (like Bitcoin), don't show cents.
    if (numAbs > 1000) {
        options.minimumFractionDigits = 0;
    }
    // For single-digit prices, show more precision.
    if (numAbs < 10) {
        options.minimumFractionDigits = 2;
    }

    const formattedValue = new Intl.NumberFormat('en-US', options).format(value);

    // Handle compact formatting's prefix ($)
    if (style === 'compact' && suffix) {
        // Re-format 'value' without currency style to attach suffix
        const compactValue = new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 2,
            minimumFractionDigits: (value < 10 && value > -10) ? 2 : 0, // 1.5B vs 300M
        }).format(value);
        return `${compactValue}${suffix}`;
    }

    return `${formattedValue}${suffix}`;
};

const MarketDetailPage = () => {
    const { ticker } = useParams();
    const [widgetData, setWidgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');
    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getWidgetData(decodeURIComponent(ticker));
                setWidgetData(response.data);
            } catch (e) {
                console.error("Failed to fetch market detail data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ticker]);

    const getChartData = () => {
        if (!widgetData || !widgetData.historicalData) return { labels: [], prices: [] };

        const history = widgetData.historicalData;
        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return { labels: [], prices: [] };

        let filteredHistory = history;

        if (tf.label === '1D') {
            // 1D will just show the last 2 points (today and prev close)
            filteredHistory = history.slice(-2);
        } else if (tf.label === '5D') {
            filteredHistory = history.slice(-5);
        } else if (tf.points === 'YTD') {
            const currentYear = new Date().getFullYear();
            filteredHistory = history.filter(item => new Date(item.priceDate).getFullYear() === currentYear);
        } else if (tf.label !== 'Max') {
            const pointsToTake = Math.min(history.length, tf.points);
            filteredHistory = history.slice(-pointsToTake);
        }

        return {
            labels: filteredHistory.map(item => new Date(item.priceDate).toLocaleDateString()),
            prices: filteredHistory.map(item => item.closePrice)
        };
    };

    const chartData = getChartData();
    const quote = widgetData?.quoteData;
    const isPos = quote?.changeAmount >= 0;

    if (loading) {
        return <div className="h-[60vh] flex items-center justify-center text-gray-500">Loading market data...</div>;
    }

    if (!quote) {
        return (
            <div className="container mx-auto p-4 max-w-4xl text-center">
                <Link to="/" className="text-blue-600 hover:underline mb-4 inline-flex items-center">
                    <ArrowLeft size={16} className="mr-1" /> Back to Home
                </Link>
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-gray-600">Could not load data for {decodeURIComponent(ticker)}.</p>
            </div>
        );
    }

    // --- Key Statistics Data Array ---
    const stats = [
        { label: 'Previous Close', value: formatNumber(quote.previousClose, 'currency', quote.currency) },
        { label: 'Open', value: formatNumber(quote.openPrice, 'currency', quote.currency) },
        { label: 'Day\'s Range', value: `${formatNumber(quote.dayLow, 'currency', quote.currency)} - ${formatNumber(quote.dayHigh, 'currency', quote.currency)}` },
        { label: '52 Week Range', value: `${formatNumber(quote.fiftyTwoWeekLow, 'currency', quote.currency)} - ${formatNumber(quote.fiftyTwoWeekHigh, 'currency', quote.currency)}` },
        { label: 'Volume', value: formatNumber(quote.volume, 'compact') },
        { label: 'Market Cap', value: formatNumber(quote.marketCap, 'compact') },
        { label: 'P/E Ratio (TTM)', value: formatNumber(quote.peRatio) },
        { label: 'Dividend Yield', value: quote.dividendYield ? `${(quote.dividendYield * 100).toFixed(2)}%` : 'N/A' },
    ];

    // Truncate description
    const description = quote.description || '';
    const isLongDesc = description.length > 300;
    const displayedDesc = showFullDesc ? description : description.substring(0, 300);


    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 max-w-6xl font-sans">

                {/* --- Component 2: Page Hero --- */}
                <div className="mb-4">
                    <Link to="/" className="text-sm text-blue-600 hover:underline mb-2 inline-flex items-center">
                        <ArrowLeft size={14} className="mr-1" /> Back to Markets
                    </Link>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{quote.name || decodeURIComponent(ticker)}</h1>
                            <div className="text-sm text-gray-500 mt-1">
                                {ticker} · {quote.currency}
                                {quote.lastUpdated && ` · As of ${new Date(quote.lastUpdated).toLocaleString()}`}
                            </div>
                        </div>
                        <button className="p-2 rounded-full hover:bg-gray-200 text-gray-600">
                            <Share2 size={18} />
                        </button>
                    </div>

                    <div className="mt-2">
                        <span className="text-4xl font-bold text-gray-900">{formatNumber(quote.currentPrice, 'currency', quote.currency)}</span>
                        <div className={`flex items-center text-xl font-medium mt-1 ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                            {isPos ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                            <span>{formatNumber(quote.changeAmount)}</span>
                            <span className="ml-2">({quote.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%)</span>
                        </div>
                    </div>
                </div>

                {/* --- Component 3: Main Content Body (Asymmetric 2-Column Layout) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* --- 4a. Left Column (Wide) --- */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-lg p-4">

                        {/* Module 1: Interactive Chart */}
                        <div className="flex justify-center bg-gray-100 rounded-md p-1 mb-4">
                            {timeframes.map(tf => (
                                <button
                                    key={tf.label}
                                    onClick={() => setActiveTimeframe(tf.label)}
                                    className={`flex-1 px-3 py-1 rounded text-xs font-bold transition-colors ${activeTimeframe === tf.label ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-[250px] md:h-[400px]">
                            <MarketChart chartData={chartData} previousClose={quote.previousClose} isPositive={isPos} />
                        </div>
                    </div>

                    {/* --- 4b. Right Column (Narrow) --- */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Module 1: Data Summary Card */}
                        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Statistics</h2>
                            <div className="space-y-3 text-sm">
                                {stats.map(stat => (
                                    <div key={stat.label} className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">{stat.label}</span>
                                        <span className="font-medium text-gray-900 text-right">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- "About" Section (Full Width Below Chart) --- */}
                    {description && (
                        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">About {quote.name}</h2>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {displayedDesc}{!showFullDesc && isLongDesc ? '...' : ''}
                            </p>
                            {isLongDesc && (
                                <button
                                    onClick={() => setShowFullDesc(!showFullDesc)}
                                    className="text-sm font-semibold text-blue-600 hover:underline mt-2"
                                >
                                    {showFullDesc ? 'Read Less' : 'Read More'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarketDetailPage;