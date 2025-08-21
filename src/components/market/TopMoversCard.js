import React, { useState, useEffect } from 'react';

const TopMoversCard = ({ title, fetchData, type }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null); // Reset error on new fetch
                const response = await fetchData();
                
                // Check if the API returned an error payload
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setData(response.data);
                }

            } catch (err) {
                // This catches network errors or non-2xx responses
                if (err.response && err.response.data && err.response.data.error) {
                    // Use the detailed error from our backend
                    setError(err.response.data.error);
                } else {
                    // Fallback for generic network issues
                    setError('Network error. Could not connect to the server.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [fetchData]);

    const getRowColor = () => {
        if (type === 'gainer') return 'text-green-600';
        if (type === 'loser') return 'text-red-600';
        return 'text-gray-800';
    };

    const getDisplayValue = (stock) => {
        if (type === 'active') {
            return `$${parseFloat(stock.price).toFixed(2)}`;
        }
        return stock.changePercentage;
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm p-3">
            <h4 className="font-bold text-sm mb-2 text-gray-800">{title}</h4>
            <div className="space-y-2">
                {loading ? (
                    <p className="text-xs text-gray-500">Loading...</p>
                ) : error ? (
                    // Display the detailed error message
                    <p className="text-xs text-red-500 break-words">{error}</p>
                ) : (
                    data.slice(0, 5).map((stock) => (
                        <div key={stock.ticker} className="flex justify-between items-center text-xs">
                            <span className="font-semibold truncate pr-2">{stock.ticker}</span>
                            <div className="text-right">
                                <span className={`font-bold ${getRowColor()}`}>
                                    {getDisplayValue(stock)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopMoversCard;