import React, { useState, useEffect } from 'react';
import { getMostActive } from '../../apiConfig'; 

const formatValue = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
};

const MostActiveCard = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMostActive();
                const processedData = data.slice(0, 5).map(stock => ({
                    company: stock.ticker,
                    name: stock.name,
                    price: parseFloat(stock.price),
                    change: parseFloat(stock.changeAmount),
                    changePercentage: stock.changePercentage, 
                    value: parseFloat(stock.price) * parseFloat(stock.volume)
                }));
                setStocks(processedData);
            } catch (err) {
                console.error("API Fetch Error:", err);
                setError(err.message || 'Failed to fetch most active stocks.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRowColor = (stock) => {
        return stock.change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const renderContent = () => {
        if (loading) {
            return <div className="p-4 text-center text-slate-500 text-xs">Loading Data...</div>;
        }
        if (error) {
            return <div className="p-4 text-center text-red-600 text-xs font-semibold">{error}</div>;
        }
        if (stocks.length === 0) {
            return <div className="p-4 text-center text-slate-500 text-xs">No data available to display.</div>;
        }
        return (
            <div className="divide-y divide-gray-100">
                {stocks.map(stock => (
                    <div key={stock.company} className="px-2 py-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-800 truncate" title={stock.name}>{stock.company}</span>
                            <span className={`font-bold ${getRowColor(stock)}`}>{stock.changePercentage}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                            <span>{formatValue(stock.value)}</span>
                            <div className="flex items-center">
                                <span className="font-medium mr-2">${stock.price.toFixed(2)}</span>
                                <span className={getRowColor(stock)}>
                                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    return (
        <div className="bg-white border border-gray-200/90 shadow-sm">
            <h4 className="font-bold text-sm p-2 border-b border-gray-200/90 text-gray-800">Most Active</h4>
            {renderContent()}
        </div>
    );
};

export default MostActiveCard;