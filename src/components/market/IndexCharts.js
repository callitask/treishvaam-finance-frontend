import React, { useState, useEffect, useRef } from 'react';
import MarketChart from './MarketChart';
import { getWidgetData } from '../../apiConfig';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

// Expanded Global List (mapped to ETF proxies)
const indices = [
    { symbol: 'SPY', name: 'S&P 500' },
    { symbol: 'DIA', name: 'Dow Jones' },
    { symbol: 'QQQ', name: 'NASDAQ' },
    { symbol: 'IWM', name: 'Russell 2K' },
    { symbol: 'VTI', name: 'NYSE Comp' },
    { symbol: 'VIXY', name: 'VIX' },
    { symbol: 'EWG', name: 'DAX (DE)' },
    { symbol: 'EWU', name: 'FTSE (UK)' },
    { symbol: 'EWH', name: 'HSI (HK)' },
];

const timeframes = [
    { label: '1M', days: 30 },
    { label: '6M', days: 180 },
    { label: 'YTD', days: 'YTD' },
    { label: '1Y', days: 365 },
    { label: '5Y', days: 1825 },
    { label: 'Max', days: 99999 },
];

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const IndexCharts = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');
    const [loading, setLoading] = useState(true);
    const [widgetData, setWidgetData] = useState(null);
    const tabsRef = useRef(null);

    const activeIndexData = indices[activeIndex];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setWidgetData(null); // Clear prev data while loading
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
    }, [activeIndex, activeIndexData.symbol]);

    const getChartData = () => {
        if (!widgetData || !widgetData.historicalData) return { labels: [], prices: [] };

        const history = widgetData.historicalData;
        const tf = timeframes.find(t => t.label === activeTimeframe);

        let filteredHistory = history;
        if (tf.days === 'YTD') {
            const currentYear = new Date().getFullYear();
            filteredHistory = history.filter(item => new Date(item.priceDate).getFullYear() === currentYear);
        } else if (tf.label !== 'Max') {
            // Approximate days for speed
            const daysToTake = Math.min(history.length, Math.floor(tf.days * (252 / 365)));
            filteredHistory = history.slice(-daysToTake);
        }

        return {
            labels: filteredHistory.map(item => new Date(item.priceDate).toLocaleDateString()),
            prices: filteredHistory.map(item => item.closePrice)
        };
    };

    const chartData = getChartData();
    const quote = widgetData?.quoteData;
    const isPos = quote?.changeAmount >= 0;

    // Drag-to-scroll for tabs
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
            {/* Scrollable Tab Navigation */}
            <div
                ref={tabsRef}
                onMouseDown={handleMouseDown}
                className="flex border-b border-gray-100 bg-gray-50/80 overflow-x-auto no-scrollbar cursor-grab"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {indices.map((idx, i) => (
                    <button
                        key={idx.symbol}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-shrink-0 px-3 py-2 font-semibold transition-colors whitespace-nowrap ${activeIndex === i
                            ? 'bg-white text-blue-700 border-b-2 border-blue-700'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        {idx.name}
                    </button>
                ))}
            </div>

            <div className="p-3 min-h-[260px]">
                {loading || !quote ? (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 animate-pulse">Loading data...</div>
                ) : (
                    <>
                        <div className="flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-gray-900">
                                {formatNumber(quote.currentPrice)}
                                <span className="text-[10px] font-medium text-gray-500 ml-1">USD</span>
                            </span>
                            <div className={`flex items-center font-bold ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                                {isPos ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                {quote.changeAmount} ({quote.changePercent}%)
                            </div>
                        </div>

                        <div className="h-[120px] my-3 -mx-1">
                            <MarketChart chartData={chartData} previousClose={quote.previousClose} isPositive={isPos} />
                        </div>

                        <div className="flex justify-between bg-gray-50 rounded-md p-1 mb-3">
                            {timeframes.map(tf => (
                                <button
                                    key={tf.label}
                                    onClick={() => setActiveTimeframe(tf.label)}
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
                    </>
                )}
            </div>
        </div>
    );
};

export default IndexCharts;