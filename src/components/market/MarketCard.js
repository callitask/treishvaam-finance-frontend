import React from 'react';

// Helper function to format large numbers for volume
const formatVolume = (volume) => {
    if (typeof volume !== 'number' || isNaN(volume)) return '-';
    if (volume >= 1_000_000_000) {
        return `${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
        return `${(volume / 1_000_000).toFixed(2)}M`;
    }
    if (volume >= 1_000) {
        return `${(volume / 1_000).toFixed(1)}K`;
    }
    return volume.toString();
};

const MarketCard = ({ title, data, cardType }) => {
    const isGainer = cardType === 'gainer';
    const isLoser = cardType === 'loser';

    const getRowColor = (stock) => {
        const change = parseFloat(stock.changeAmount);
        if (isGainer || (cardType === 'active' && change >= 0)) return 'text-green-600';
        if (isLoser || (cardType === 'active' && change < 0)) return 'text-red-600';
        return 'text-gray-800';
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm overflow-hidden rounded-md">
            <h4 className="font-bold text-sm p-3 border-b border-gray-200/90 text-gray-800">{title}</h4>
            <div>
                <table className="w-full text-xs">
                    <caption className="sr-only">{title} Data Table</caption>
                    <thead>
                        <tr className="text-left text-gray-500 uppercase font-medium text-[11px]">
                            <th scope="col" className="py-1 px-2 font-semibold">Symbol</th>
                            <th scope="col" className="py-1 px-2 font-semibold">Name</th>
                            <th scope="col" className="py-1 px-2 font-semibold text-right whitespace-nowrap">Price</th>
                            <th scope="col" className="py-1 px-2 font-semibold text-right whitespace-nowrap">Chg</th>
                            <th scope="col" className="py-1 px-2 font-semibold text-right whitespace-nowrap">%Chg</th>
                            <th scope="col" className="py-1 px-2 font-semibold text-right whitespace-nowrap">Vol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.slice(0, 5).map((stock) => (
                            <tr key={stock.ticker}>
                                <td className="py-1.5 px-2 font-bold text-gray-700 truncate">{stock.ticker}</td>
                                <td className="py-1.5 px-2 text-gray-600 truncate">{stock.name}</td>
                                <td className="py-1.5 px-2 text-right font-medium text-gray-700 whitespace-nowrap">
                                    ${parseFloat(stock.price).toFixed(2)}
                                </td>
                                <td className={`py-1.5 px-2 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                    {parseFloat(stock.changeAmount) >= 0 ? '+' : ''}{parseFloat(stock.changeAmount).toFixed(2)}
                                </td>
                                <td className={`py-1.5 px-2 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                    {stock.changePercentage}
                                </td>
                                <td className="py-1.5 px-2 text-right font-medium text-gray-600 whitespace-nowrap">
                                    {formatVolume(stock.volume)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketCard;