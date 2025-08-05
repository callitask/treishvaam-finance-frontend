import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuoteList = ({ symbols }) => {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const DataRow = ({ data }) => {
        if (!data || !data.price) return null;
        const isPositive = parseFloat(data.changePercent) >= 0;
        const changeColor = isPositive ? 'text-green-600' : 'text-red-600';

        return (
            <div className="flex justify-between items-center text-sm py-1.5">
                <span className="font-semibold text-gray-800 truncate pr-2">{data.symbol}</span>
                <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{parseFloat(data.price).toFixed(2)}</span>
                    <span className={`font-bold w-16 text-right ${changeColor}`}>{data.changePercent}</span>
                </div>
            </div>
        );
    };

    useEffect(() => {
        const fetchAllQuotes = async () => {
            setLoading(true);
            setError(null);
            const apiKey = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
            if (!apiKey) {
                setError("API Key is not set.");
                setLoading(false);
                return;
            }
            const fetchedQuotes = [];
            for (const symbol of symbols) {
                try {
                    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
                    const response = await axios.get(url);
                    const quote = response.data['Global Quote'];
                    if (quote && Object.keys(quote).length > 0) {
                        fetchedQuotes.push({
                            symbol: quote['01. symbol'],
                            price: quote['05. price'],
                            changePercent: quote['10. change percent'],
                        });
                    }
                    await new Promise(resolve => setTimeout(resolve, 15000));
                } catch (error) {
                    console.error(`Failed to fetch quote for ${symbol}`, error);
                }
            }
            setQuotes(fetchedQuotes);
            setLoading(false);
        };
        fetchAllQuotes();
    }, [symbols]);

    if (loading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: symbols.length }).map((_, i) => <div key={i} className="h-6 bg-gray-200 rounded-md animate-pulse"></div>)}
            </div>
        );
    }
    
    if (quotes.length === 0) {
        return <p className="text-xs text-gray-500 p-2">{error || "No data available."}</p>;
    }

    return (
        <div className="space-y-1">
            {quotes.map(quote => <DataRow key={quote.symbol} data={quote} />)}
        </div>
    );
};

export default QuoteList; // <-- MAKE SURE THIS LINE EXISTS