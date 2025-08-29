// src/components/market/MostActiveCard.js
import React, { useState, useEffect } from 'react';
// --- UPDATED: Import the function from your apiConfig to call your own backend ---
import { getMostActive } from '../../apiConfig'; // Adjust the path if necessary

// --- Helper Function to format large numbers ---
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
        // --- UPDATED: This logic now calls your backend via apiConfig.js ---
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMostActive();
                // Map the data from your backend to the structure this component expects
                const processedData = data.slice(0, 5).map(stock => ({
                    company: stock.ticker,
                    name: stock.name,
                    price: parseFloat(stock.price),
                    change: parseFloat(stock.changeAmount),
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
    }, []); // Runs once on component mount

    const renderHeader = () => (
       <div className="flex justify-between items-center p-3">
           <h3 className="text-base font-bold text-slate-800">Most Active</h3>
           {/* The NSE/NASDAQ switcher has been removed as this card now uses a single data source */}
       </div>
    );

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
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[320px]">
                    <thead>
                        <tr className="border-b border-black/10">
                            <th className="p-2 pl-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Company</th>
                            <th className="p-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-right">Price</th>
                            <th className="p-2 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-right">Change</th>
                            <th className="p-2 pr-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-right">Value (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(stock => {
                            const isPositive = stock.change >= 0;
                            return (
                                <tr key={stock.company} className="border-b border-black/5 last:border-none">
                                    <td className="p-2 pl-3 text-xs font-medium text-slate-800 truncate" title={stock.name}>{stock.company}</td>
                                    <td className="p-2 text-xs font-medium text-slate-800 text-right">{stock.price.toFixed(2)}</td>
                                    <td className={`p-2 text-xs font-bold text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                                    </td>
                                    <td className={`p-2 pr-3 text-xs font-medium text-right text-slate-700`}>
                                        {formatValue(stock.value)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderFooter = () => (
        <div className="p-1 border-t border-black/10">
            <button className="w-full text-center text-xs font-semibold text-slate-600 py-1 rounded-md hover:bg-black/10 transition-colors duration-200">
                + See all Most Active
            </button>
        </div>
    );

    return (
        <div className="bg-white/20 backdrop-blur-xl shadow-lg ring-1 ring-black/5 overflow-hidden">
            {renderHeader()}
            <div className='px-3 pb-2'>
                <p className='text-[11px] text-slate-500 font-medium'>Data as of 1 Day</p>
            </div>
            {renderContent()}
            {renderFooter()}
        </div>
    );
};

export default MostActiveCard;