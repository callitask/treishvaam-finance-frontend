"use client";
import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { getWidgetData } from '../../apiConfig';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatSmartPrice } from '../../utils/marketFormatter';

const TradingViewChart = React.lazy(() => import('./TradingViewChart'));

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
        if (!activeIndexData) return;
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getWidgetData(activeIndexData.symbol);
                if (isMounted && response.data) setWidgetData(response.data);
            } catch (e) {
                console.error("Market widget error:", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [activeIndexData]);

    const quote = widgetData?.quoteData;

    const rawPrice = quote?.currentPrice ?? quote?.price ?? null;
    const rawChangeAmt = quote?.changeAmount ?? quote?.change ?? 0;
    const rawChangePct = quote?.changePercent ?? quote?.changePercentage ?? 0;
    const isPos = rawChangeAmt >= 0;

    const chartData = useMemo(() => {
        if (!widgetData || !widgetData.historicalData) return [];
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
        const onMouseMove = (e) => { ele.scrollLeft = pos.left - (e.clientX - pos.x); };
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg overflow-hidden font-sans text-[11px] transition-colors duration-300">
            <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
                {Object.keys(MARKET_INDICES).map((market) => (
                    <button
                        key={market}
                        onClick={() => setActiveMarket(market)}
                        className={`flex-1 px-3 py-2 text-center text-xs font-bold transition-colors whitespace-nowrap ${activeMarket === market ? 'text-sky-700 dark:text-sky-400 border-b-2 border-sky-700 dark:border-sky-400 bg-sky-50/50 dark:bg-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {market}
                    </button>
                ))}
            </div>

            <div ref={tabsRef} onMouseDown={handleMouseDown} className="flex border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 overflow-x-auto no-scrollbar cursor-grab">
                {indicesToShow.map((idx, i) => (
                    <button
                        key={idx.symbol}
                        onClick={() => setActiveIndex(i)}
                        className={`flex-shrink-0 px-3 py-2 font-semibold transition-colors whitespace-nowrap ${activeIndex === i ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-400 border-b-2 border-sky-200 dark:border-sky-900' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                        {idx.name}
                    </button>
                ))}
            </div>

            <div className="p-3 min-h-[260px]">
                {loading || !quote || !activeIndexData ? (
                    <div className="h-[200px] flex items-center justify-center text-slate-400 dark:text-slate-500 animate-pulse">
                        {loading ? "Loading market data..." : "Data Unavailable"}
                    </div>
                ) : (
                    <Link href={`/market/${encodeURIComponent(activeIndexData.symbol)}`} className="block group">
                        <div className="flex items-baseline justify-between mb-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {formatSmartPrice(rawPrice, quote.currency, activeIndexData.symbol)}
                                {/* Explicit Native Currency display next to the price */}
                                {!activeIndexData.symbol.startsWith('^') && quote.currency && quote.currency !== 'null' && (
                                    <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest">{quote.currency}</span>
                                )}
                            </span>

                            {/* RESTORED CLASSIC GREEN/RED */}
                            <div className={`flex items-center font-bold ${isPos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {isPos ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                {rawChangeAmt >= 0 ? '+' : ''}{rawChangeAmt.toFixed(2)} ({rawChangePct >= 0 ? '+' : ''}{rawChangePct.toFixed(2)}%)
                            </div>
                        </div>

                        <div className="h-[150px] -mx-1">
                            <Suspense fallback={<div className="w-full h-full bg-slate-50 animate-pulse rounded"></div>}>
                                <TradingViewChart data={chartData} color={isPos ? '#16a34a' : '#dc2626'} height={150} />
                            </Suspense>
                        </div>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 mt-3">
                            <div className="flex justify-between"><span>Open</span><span className="font-medium text-slate-900 dark:text-slate-200">{formatSmartPrice(quote.openPrice || quote.open, quote.currency, activeIndexData.symbol)}</span></div>
                            <div className="flex justify-between"><span>High</span><span className="font-medium text-slate-900 dark:text-slate-200">{formatSmartPrice(quote.dayHigh, quote.currency, activeIndexData.symbol)}</span></div>
                            <div className="flex justify-between"><span>Prev</span><span className="font-medium text-slate-900 dark:text-slate-200">{formatSmartPrice(quote.previousClose, quote.currency, activeIndexData.symbol)}</span></div>
                            <div className="flex justify-between"><span>Low</span><span className="font-medium text-slate-900 dark:text-slate-200">{formatSmartPrice(quote.dayLow, quote.currency, activeIndexData.symbol)}</span></div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default IndexCharts;