import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // --- NEW ---
import MarketChart from './MarketChart';
import { getWidgetData } from '../../apiConfig';
import { TrendingUp, TrendingDown } from 'lucide-react';

// --- MODIFIED: Split into two lists ---
const globalIndices = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^DJI', name: 'Dow Jones' },
    { symbol: '^IXIC', name: 'NASDAQ' },
    { symbol: '^RUT', name: 'Russell 2K' },
    { symbol: '^NYA', name: 'NYSE Comp' },
    { symbol: '^VIX', name: 'VIX' },
    { symbol: '^GDAXI', name: 'DAX (DE)' },
    { symbol: '^FTSE', name: 'FTSE (UK)' },
    { symbol: '^HSI', name: 'HSI (HK)' },
    { symbol: 'GC=F', name: 'Gold' },
    { symbol: 'CL=F', name: 'Crude Oil' },
];

const indianIndices = [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
];

const timeframes = [
    { label: '1M', points: 22 },
    { label: '6M', points: 126 },
    { label: 'YTD', points: 'YTD' },
    { label: '1Y', points: 252 },
    { label: '5Y', points: 1260 },
    { label: 'Max', points: 99999 },
];

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    // Handle large numbers
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    // Handle small numbers and standard formatting
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const IndexCharts = () => {
    const [activeMarket, setActiveMarket] = useState('Global'); // --- NEW ---
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');
    const [loading, setLoading] = useState(true);
    const [widgetData, setWidgetData] = useState(null);
    const tabsRef = useRef(null);

    // --- NEW: Determine which list to show ---
    const indicesToShow = activeMarket === 'Global' ? globalIndices : indianIndices;
    const activeIndexData = indicesToShow[activeIndex] || indicesToShow[0];

    // --- NEW: Reset index when market changes ---
    useEffect(() => {
        setActiveIndex(0);
        setWidgetData(null); // Clear old data
    }, [activeMarket]);

    useEffect(() => {
        // Ensure activeIndexData is valid before fetching
        if (!activeIndexData) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setWidgetData(null);
            try {
                const response = await getWidgetData(activeIndexData.symbol);
                if (response.data) {
                    setWidgetData(response.data);
                }
            } catch (e) {
                console.error("Market widget error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeIndex, activeIndexData]); // Depend on activeIndexData

    const getChartData = () => {
        if (!widgetData || !widgetData.historicalData) return { labels: [], prices: [] };

        const history = widgetData.historicalData;
        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return { labels: [], prices: [] }; // Safety check

        let filteredHistory = history;
        if (tf.points === 'YTD') {
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

    const handleMouseDown = (e) => {
        const ele = tabsRef.current;
        if (!ele) return;
        ele.style.cursor = 'grabbing';
        ele.style.userSelect = 'none';
        let pos = { left: ele.scrollLeft, x: e.clientX };
        const onMouseMove = (e) => {
            const dx = e.clientX - pos.x;
            ele.scrollLeft = pos.left - dx;
        };
        const onMouseUp = () => {
            ele.style.cursor = 'grab';
            ele.style.removeProperty('user-select');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden font-sans text-[11px]">

            {/* --- NEW: Market Tabs --- */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveMarket('Global')}
                    className={`flex-1 px-3 py-2 text-center text-xs font-bold transition-colors ${activeMarket === 'Global' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Global
                </button>
                <button
                    onClick={() => setActiveMarket('Indian')}
                    className={`flex-1 px-3 py-2 text-center text-xs font-bold transition-colors ${activeMarket === 'Indian' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Indian
                </button>
            </div>

            {/* Scrollable Index Tabs */}
            <div
                ref={tabsRef}
                onMouseDown={handleMouseDown}
                className="flex border-b border-gray-100 bg-gray-50/80 overflow-x-auto no-scrollbar cursor-grab"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {indicesToShow.map((idx, i) => (
                    <button
                        key={idx.symbol}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-shrink-0 px-3 py-2 font-semibold transition-colors whitespace-nowrap ${activeIndex === i
                            ? 'bg-white text-blue-700'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        {idx.name}
                    </button>
                ))}
            </div>

            <div className="p-3 min-h-[260px]">
                {loading || !quote || !activeIndexData ? (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 animate-pulse">Loading data...</div>
                ) : (
                    // --- NEW: Link wrapper ---
                    <Link to={`/market/${encodeURIComponent(activeIndexData.symbol)}`} className="block">
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatNumber(quote.currentPrice)}
                                {/* --- MODIFIED: Dynamic Currency --- */}
                                <span className="text-[10px] font-medium text-gray-500 ml-1">{quote.currency || ''}</span>
                            </span>
                            <div className={`flex items-center font-bold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                                {isPos ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                {formatNumber(quote.changeAmount)} ({quote.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%)
                            </div>
                        </div>

                        <div className="h-[120px] my-3 -mx-1">
                            <MarketChart chartData={chartData} previousClose={quote.previousClose} isPositive={isPos} />
                        </div>

                        <div className="flex justify-between bg-gray-50 rounded-md p-1 mb-3">
                            {timeframes.map(tf => (
                                <button
                                    key={tf.label}
                                    // --- MODIFIED: Added event stoppers ---
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setActiveTimeframe(tf.label);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activeTimeframe === tf.label ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {tf.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-500">
                            <div className="flex justify-between"><span>Open</span><span className="font-medium text-gray-900">{formatNumber(quote.openPrice)}</span></div>
                            <div className="flex justify-between"><span>High</span><span className="font-medium text-gray-900">{formatNumber(quote.dayHigh)}</span></div>
                            <div className="flex justify-between"><span>Prev</span><span className="font-medium text-gray-900">{formatNumber(quote.previousClose)}</span></div>
                            <div className="flex justify-between"><span>Low</span><span className="font-medium text-gray-900">{formatNumber(quote.dayLow)}</span></div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default IndexCharts;