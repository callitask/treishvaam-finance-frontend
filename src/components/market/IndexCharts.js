// src/components/market/IndexCharts.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TradingViewChart from './TradingViewChart'; // <--- NEW IMPORT
import { getWidgetData } from '../../apiConfig';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MARKET_INDICES = {
    'US': [
        { symbol: '^DJI', name: 'Dow Jones' },
        { symbol: '^GSPC', name: 'S&P 500' },
        { symbol: '^IXIC', name: 'NASDAQ' },
        { symbol: '^RUT', name: 'Russell 2K' },
        { symbol: '^VIX', name: 'VIX' }
    ],
    'Europe': [
        { symbol: '^GDAXI', name: 'DAX' },
        { symbol: '^FTSE', name: 'FTSE 100' },
        { symbol: '^FCHI', name: 'CAC 40' },
        { symbol: '^IBEX', name: 'IBEX 35' },
        { symbol: '^STOXX50E', name: 'STOXX 50' }
    ],
    'India': [
        { symbol: '^NSEI', name: 'NIFTY 50' },
        { symbol: '^BSESN', name: 'SENSEX' },
        { symbol: '^NSEBANK', name: 'Nifty Bank' },
        { symbol: '^CNXIT', name: 'Nifty IT' },
        { symbol: '^BSESCP', name: 'BSE SmallCap' }
    ],
    'Commodities': [
        { symbol: 'GC=F', name: 'Gold' },
        { symbol: 'CL=F', name: 'Crude Oil' },
        { symbol: 'SI=F', name: 'Silver' }
    ],
    'Currencies': [
        { symbol: 'USDINR=X', name: 'USD / INR' },
        { symbol: 'EURINR=X', name: 'EUR / INR' },
        { symbol: 'JPYINR=X', name: 'JPY / INR' },
        { symbol: 'GBPINR=X', name: 'GBP / INR' },
        { symbol: 'AUDINR=X', name: 'AUD / INR' }
    ],
    'Crypto': [
        { symbol: 'BTC-INR', name: 'Bitcoin' },
        { symbol: 'ETH-INR', name: 'Ethereum' },
        { symbol: 'SOL-INR', name: 'Solana' },
        { symbol: 'XRP-INR', name: 'XRP' },
        { symbol: 'DOGE-INR', name: 'Dogecoin' }
    ]
};

const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (Math.abs(num) >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const IndexCharts = () => {
    const [activeMarket, setActiveMarket] = useState('US');
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [widgetData, setWidgetData] = useState(null);
    const tabsRef = useRef(null);

    const indicesToShow = MARKET_INDICES[activeMarket] || [];
    const activeIndexData = indicesToShow[activeIndex] || indicesToShow[0];

    useEffect(() => {
        setActiveIndex(0);
        setWidgetData(null);
    }, [activeMarket]);

    useEffect(() => {
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
    }, [activeIndexData]);

    // Data Preparation
    const quote = widgetData?.quoteData;
    const isPos = quote?.changeAmount >= 0;

    const chartData = useMemo(() => {
        if (!widgetData || !widgetData.historicalData) return [];
        // Sort and map for TradingView
        return [...widgetData.historicalData]
            .sort((a, b) => new Date(a.priceDate) - new Date(b.priceDate))
            .map(item => ({
                time: item.priceDate,
                value: parseFloat(item.closePrice)
            }));
    }, [widgetData]);

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
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg overflow-hidden font-sans text-[11px] transition-colors duration-300">

            {/* Market Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                {Object.keys(MARKET_INDICES).map((market) => (
                    <button
                        key={market}
                        onClick={() => setActiveMarket(market)}
                        className={`flex-1 px-3 py-2 text-center text-xs font-bold transition-colors whitespace-nowrap 
                            ${activeMarket === market
                                ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 dark:border-blue-400 bg-blue-50/50 dark:bg-slate-700'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                        {market}
                    </button>
                ))}
            </div>

            {/* Ticker Tabs */}
            <div
                ref={tabsRef}
                onMouseDown={handleMouseDown}
                className="flex border-b border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800 overflow-x-auto no-scrollbar cursor-grab"
            >
                {indicesToShow.map((idx, i) => (
                    <button
                        key={idx.symbol}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-shrink-0 px-3 py-2 font-semibold transition-colors whitespace-nowrap 
                            ${activeIndex === i
                                ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-b-2 border-blue-200 dark:border-blue-900'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    >
                        {idx.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-3 min-h-[260px]">
                {loading || !quote || !activeIndexData ? (
                    <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500 animate-pulse">
                        {loading ? "Loading market data..." : "Select an index"}
                    </div>
                ) : (
                    <Link to={`/market/${encodeURIComponent(activeIndexData.symbol)}`} className="block group">
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {formatNumber(quote.currentPrice)}
                                <span className="text-[10px] font-medium text-gray-500 ml-1">{quote.currency || ''}</span>
                            </span>
                            <div className={`flex items-center font-bold ${isPos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {isPos ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                {formatNumber(quote.changeAmount)} ({quote.changePercent ? quote.changePercent.toFixed(2) : '0.00'}%)
                            </div>
                        </div>

                        {/* Updated Chart */}
                        <div className="h-[150px] -mx-1">
                            <TradingViewChart
                                data={chartData}
                                color={isPos ? '#22c55e' : '#ef4444'}
                                height={150}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-3">
                            <div className="flex justify-between"><span>Open</span><span className="font-medium text-gray-900 dark:text-gray-200">{formatNumber(quote.openPrice)}</span></div>
                            <div className="flex justify-between"><span>High</span><span className="font-medium text-gray-900 dark:text-gray-200">{formatNumber(quote.dayHigh)}</span></div>
                            <div className="flex justify-between"><span>Prev</span><span className="font-medium text-gray-900 dark:text-gray-200">{formatNumber(quote.previousClose)}</span></div>
                            <div className="flex justify-between"><span>Low</span><span className="font-medium text-gray-900 dark:text-gray-200">{formatNumber(quote.dayLow)}</span></div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default IndexCharts;