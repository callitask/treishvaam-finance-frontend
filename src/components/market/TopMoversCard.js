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
                setError('Data could not be loaded at this time.');
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
            return <p className="p-3 text-xs text-gray-500">Loading...</p>;
        }
        if (error) {
            return <p className="p-3 text-xs text-red-500 break-words">{error}</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-500 uppercase font-semibold">
                            <th className="p-1.5 pl-3">Symbol</th>
                            <th className="p-1.5 text-right">Price</th>
                            <th className="p-1.5 text-right">Change</th>
                            <th className="p-1.5 pr-3 text-right">% Chg</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/90">
                        {data.slice(0, 5).map((stock) => (
                            <tr key={stock.ticker}>
                                <td className="p-1.5 pl-3 font-semibold text-gray-800">{stock.ticker}</td>
                                <td className="p-1.5 text-right font-medium text-gray-800">${parseFloat(stock.price).toFixed(2)}</td>
                                <td className={`p-1.5 text-right font-bold ${getRowColor(stock)}`}>
                                    {parseFloat(stock.changeAmount) >= 0 ? '+' : ''}{parseFloat(stock.changeAmount).toFixed(2)}
                                </td>
                                <td className={`p-1.5 pr-3 text-right font-bold ${getRowColor(stock)}`}>{stock.changePercentage}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm overflow-hidden">
            <h4 className="font-bold text-sm p-3 border-b border-gray-200/90 text-gray-800">{title}</h4>
            {renderContent()}
        </div>
    );
};

export default TopMoversCard;