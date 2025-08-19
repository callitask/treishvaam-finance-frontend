// src/components/market/MarketCard.js
import React from 'react';

const MarketCard = ({ title, data, cardType }) => {
    const isGainer = cardType === 'gainer';
    const isLoser = cardType === 'loser';

    const getRowColor = () => {
        if (isGainer) return 'text-green-600';
        if (isLoser) return 'text-red-600';
        return 'text-gray-800';
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm p-3">
            <h4 className="font-bold text-sm mb-2 text-gray-800">{title}</h4>
            <div className="space-y-2">
                {data.slice(0, 5).map((stock, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                        <span className="font-semibold truncate pr-2">{stock.ticker}</span>
                        <div className="text-right">
                            <span className={`font-bold ${getRowColor()}`}>
                                {isGainer || isLoser ? `${stock.change_percentage}` : `$${stock.price}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketCard;