// src/components/market/MostActiveCard.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// --- Helper Functions ---
const formatValue = (value, currency) => {
    if (typeof value !== 'number' || isNaN(value)) return '-';
    if (currency === 'INR') {
        const crores = value / 1_00_00_000;
        return `₹${crores.toFixed(2)} Cr`;
    }
    // Default to USD formatting
    if (value > 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value > 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${value.toFixed(2)}`;
};

// Use .NS suffix for National Stock Exchange symbols, which is often more reliable.
const nseSymbolsToTrack = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'SBIN.NS'];

const MostActiveCard = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exchange, setExchange] = useState('NSE');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setStocks([]); // Clear previous data
            const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

            if (!apiKey) {
                setError('API key is not configured.');
                setLoading(false);
                return;
            }

            console.log(`Fetching data for ${exchange}...`);

            try {
                let processedData = [];
                if (exchange === 'NSE') {
                    const promises = nseSymbolsToTrack.map(symbol =>
                        axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
                    );
                    const responses = await Promise.all(promises);
                    
                    processedData = responses.map(response => {
                        console.log('NSE Individual Response:', response.data); // For debugging
                        if (response.data['Note']) {
                            throw new Error('API call limit reached. Please wait a minute.');
                        }
                        const quote = response.data['Global Quote'];
                        if (!quote || Object.keys(quote).length === 0) {
                            return null;
                        }
                        return {
                            company: quote['01. symbol'].replace('.NS', ''),
                            price: parseFloat(quote['05. price']),
                            change: parseFloat(quote['09. change']),
                            value: parseFloat(quote['05. price']) * parseFloat(quote['06. volume'])
                        };
                    }).filter(Boolean);

                } else if (exchange === 'NASDAQ') {
                    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;
                    const response = await axios.get(url);
                    console.log('NASDAQ Response:', response.data); // For debugging

                    if (response.data['Note']) {
                        throw new Error('API call limit reached. Please try again in a minute.');
                    }
                    const activeStocks = response.data.most_actively_traded;
                    if (!activeStocks || activeStocks.length === 0) {
                        throw new Error('Could not retrieve NASDAQ most active stocks at this time.');
                    }
                    processedData = activeStocks.slice(0, 5).map(stock => ({
                        company: stock.ticker,
                        price: parseFloat(stock.price),
                        change: parseFloat(stock.change_amount),
                        value: parseFloat(stock.price) * parseFloat(stock.volume)
                    }));
                }
                
                if (processedData.length === 0) {
                     setError(`Data is currently unavailable for ${exchange}.`);
                }
                setStocks(processedData);

            } catch (err) {
                console.error("API Fetch Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [exchange]);

    const { valueColumnHeader, currency } = useMemo(() => {
        if (exchange === 'NSE') {
            return { valueColumnHeader: 'Value (Rs Cr.)', currency: 'INR' };
        }
        return { valueColumnHeader: 'Value (USD)', currency: 'USD' };
    }, [exchange]);

    const renderHeader = () => (
       <div className="flex justify-between items-center p-3">
           <h3 className="text-base font-bold text-slate-800">Most Active</h3>
           <div className="relative">
               <select
                    value={exchange}
                    onChange={(e) => setExchange(e.target.value)}
                    className="bg-black/10 text-slate-700 text-xs font-semibold rounded-md px-2 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
                >
                    <option value="NSE">NSE</option>
                    <option value="NASDAQ">NASDAQ</option>
                </select>
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) {
            return <div className="p-4 text-center text-slate-500 text-xs">Loading Data...</div>;
        }
        // Show error message if an error occurred
        if (error) {
            return <div className="p-4 text-center text-red-600 text-xs font-semibold">{error}</div>;
        }
        // This handles the case where there is no error but also no data
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
                            <th className="p-2 pr-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider text-right">{valueColumnHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(stock => {
                            const isPositive = stock.change >= 0;
                            return (
                                <tr key={stock.company} className="border-b border-black/5 last:border-none">
                                    <td className="p-2 pl-3 text-xs font-medium text-slate-800 truncate">{stock.company}</td>
                                    <td className="p-2 text-xs font-medium text-slate-800 text-right">{stock.price.toFixed(2)}</td>
                                    <td className={`p-2 text-xs font-bold text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {isPositive ? '+' : ''}{stock.change.toFixed(2)}
                                    </td>
                                    <td className={`p-2 pr-3 text-xs font-medium text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatValue(stock.value, currency)}
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

export default MostActiveCard