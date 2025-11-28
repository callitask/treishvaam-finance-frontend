import React, { useState, useEffect } from 'react';
import MarketChart from './MarketChart';

// --- ENTERPRISE SKELETON ROW ---
const RowSkeleton = () => (
    <tr className="animate-pulse border-b border-gray-50 last:border-none">
        <td className="py-2.5 px-1"><div className="h-3 bg-gray-100 rounded w-12"></div></td>
        <td className="py-2.5 px-1"><div className="h-3 bg-gray-100 rounded w-16 ml-auto"></div></td>
        <td className="py-2.5 px-1"><div className="h-3 bg-gray-100 rounded w-12 ml-auto"></div></td>
        <td className="py-2.5 px-1"><div className="h-3 bg-gray-100 rounded w-10 ml-auto"></div></td>
    </tr>
);

const TopMoversCard = ({ title, fetchData, type }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStock, setSelectedStock] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchData();
                setData(response.data || []);
            } catch (err) {
                setError('Data unavailable');
                console.error("Failed to fetch top movers:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchData]);

    const getRowColor = (stock) => {
        const change = parseFloat(stock.changeAmount);
        if (type === 'gainer' || (type === 'active' && change >= 0)) return 'text-green-600';
        if (type === 'loser' || (type === 'active' && change < 0)) return 'text-red-600';
        return 'text-gray-800';
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="px-1">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-400 uppercase font-medium text-[10px]">
                                <th className="py-1 px-1">Symbol</th>
                                <th className="py-1 px-1 text-right">Price</th>
                                <th className="py-1 px-1 text-right">Chg</th>
                                <th className="py-1 px-1 text-right">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => <RowSkeleton key={i} />)}
                        </tbody>
                    </table>
                </div>
            );
        }

        // --- GRACEFUL ERROR STATE ---
        if (error || data.length === 0) {
            return (
                <div className="p-6 text-center">
                    <p className="text-xs text-gray-400 font-medium bg-gray-50 py-2 rounded">
                        {title} data temporarily unavailable
                    </p>
                </div>
            );
        }

        return (
            <div className="px-1">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-gray-500 uppercase font-medium text-[10px]">
                            <th className="py-1 px-1 font-semibold">Symbol</th>
                            <th className="py-1 px-1 font-semibold text-right whitespace-nowrap">Price</th>
                            <th className="py-1 px-1 font-semibold text-right whitespace-nowrap">Chg</th>
                            <th className="py-1 px-1 font-semibold text-right whitespace-nowrap">%Chg</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.slice(0, 5).map((stock) => (
                            <tr
                                key={stock.ticker}
                                className="text-[11px] cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => setSelectedStock(stock.ticker)}
                            >
                                <td className="py-2 px-1 font-bold text-gray-800 truncate font-sans">{stock.ticker}</td>
                                <td className="py-2 px-1 text-right font-medium text-gray-900 whitespace-nowrap market-data-value">
                                    ${parseFloat(stock.price).toFixed(2)}
                                </td>
                                <td className={`py-2 px-1 text-right font-bold whitespace-nowrap market-data-value ${getRowColor(stock)}`}>
                                    {parseFloat(stock.changeAmount) >= 0 ? '+' : ''}{parseFloat(stock.changeAmount).toFixed(2)}
                                </td>
                                <td className={`py-2 px-1 text-right font-bold whitespace-nowrap market-data-value ${getRowColor(stock)}`}>
                                    {stock.changePercentage}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {selectedStock && <div className="mt-2 border-t border-gray-100 pt-2"><MarketChart ticker={selectedStock} /></div>}
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wide">{title}</h4>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            {renderContent()}
        </div>
    );
};

export default TopMoversCard;