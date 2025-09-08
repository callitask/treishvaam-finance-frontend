import React, { useState, useEffect } from 'react';

const TopMoversCard = ({ title, fetchData, type }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await fetchData();
                setData(response.data || []);

            } catch (err) {
                setError('Data could not be loaded.');
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
            return <p className="p-2 text-xs text-gray-500 text-center">Loading...</p>;
        }
        if (error) {
            return <p className="p-2 text-xs text-red-500 break-words text-center">{error}</p>;
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
                            <tr key={stock.ticker} className="text-[11px]">
                                <td className="py-1 px-1 font-bold text-gray-700 truncate">{stock.ticker}</td>
                                <td className="py-1 px-1 text-right font-medium text-gray-700 whitespace-nowrap">
                                    ${parseFloat(stock.price).toFixed(2)}
                                </td>
                                <td className={`py-1 px-1 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                    {parseFloat(stock.changeAmount) >= 0 ? '+' : ''}{parseFloat(stock.changeAmount).toFixed(2)}
                                </td>
                                <td className={`py-1 px-1 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                    {stock.changePercentage}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm">
            <h4 className="font-bold text-sm p-2 border-b border-gray-200/90 text-gray-800">{title}</h4>
            {renderContent()}
        </div>
    );
};

export default TopMoversCard;