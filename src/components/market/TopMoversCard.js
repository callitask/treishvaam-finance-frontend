import React, { useState, useEffect } from 'react';
import MarketChart from './MarketChart';
import { ArrowUp, ArrowDown } from 'lucide-react';

const RowSkeleton = () => (
    <div className="flex justify-between py-3 border-b border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-100 w-1/3 rounded"></div>
        <div className="h-4 bg-gray-100 w-1/4 rounded"></div>
    </div>
);

const TopMoversCard = ({ title, fetchData, type }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetchData();
                if (isMounted) setData(response.data || []);
            } catch (err) {
                console.error(err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [fetchData]);

    const getRowColor = (change) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    const renderContent = () => {
        if (loading) return <div className="space-y-1">{[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}</div>;
        if (error || data.length === 0) return <div className="py-6 text-center text-xs text-gray-400 font-medium italic">Data unavailable</div>;

        return (
            <div className="flex flex-col">
                {/* Header Row */}
                <div className="flex text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2 border-b border-gray-100">
                    <div className="w-[45%]">Symbol</div>
                    <div className="w-[25%] text-right">Price</div>
                    <div className="w-[30%] text-right">% Chg</div>
                </div>

                {data.slice(0, 5).map((stock) => {
                    const change = parseFloat(stock.changeAmount);
                    const percent = stock.changePercentage ? stock.changePercentage.replace('%', '') : '0.00';
                    const colorClass = getRowColor(change);
                    const isSelected = selectedStock === stock.ticker;

                    return (
                        <div key={stock.ticker}>
                            <div
                                onClick={() => setSelectedStock(isSelected ? null : stock.ticker)}
                                className={`flex items-center py-2.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-gray-50' : ''}`}
                            >
                                {/* Ticker & Name */}
                                <div className="w-[45%] pr-2">
                                    <div className="font-bold text-sm text-gray-800 font-mono group-hover:text-blue-600 transition-colors">{stock.ticker}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{stock.name}</div>
                                </div>

                                {/* Price */}
                                <div className="w-[25%] text-right text-sm font-medium text-gray-900 tabular-nums">
                                    {parseFloat(stock.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>

                                {/* Change % */}
                                <div className={`w-[30%] text-right text-sm font-bold tabular-nums flex justify-end items-center gap-1 ${colorClass}`}>
                                    {change > 0 ? <ArrowUp size={12} /> : change < 0 ? <ArrowDown size={12} /> : null}
                                    {percent}%
                                </div>
                            </div>

                            {/* Expandable Chart Area */}
                            {isSelected && (
                                <div className="py-2 border-b border-gray-100 bg-gray-50 animate-in slide-in-from-top-1 duration-200">
                                    <div className="h-24">
                                        <MarketChart ticker={stock.ticker} />
                                    </div>
                                    <div className="text-center mt-1">
                                        <a href={`/market/${encodeURIComponent(stock.ticker)}`} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wide">
                                            View Full Details &rarr;
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest">{title}</h3>
                <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
            </div>
            <div className="px-4 pb-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default TopMoversCard;