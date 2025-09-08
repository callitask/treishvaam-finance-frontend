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
        // For gainers/losers, base color on the card type.
        // For most active, base color on the individual stock's change.
        const change = parseFloat(stock.changeAmount);
        if (isGainer || (cardType === 'active' && change >= 0)) return 'text-green-600';
        if (isLoser || (cardType === 'active' && change < 0)) return 'text-red-600';
        return 'text-gray-800';
    };

    return (
        <div className="bg-white border border-gray-200/90 shadow-sm overflow-hidden">
            <h4 className="font-bold text-sm p-3 border-b border-gray-200/90 text-gray-800">{title}</h4>
            <div>
                <table className="w-full text-xs table-fixed">
                    <colgroup>
                        <col style={{ width: '20%' }} />
                        <col style={{ width: '30%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '13%' }} />
                    </colgroup>
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-500 uppercase font-semibold">
                            <th className="p-2 pl-3">Symbol</th>
                            <th className="p-2">Name</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Chg</th>
                            <th className="p-2 text-right">%Chg</th>
                            <th className="p-2 pr-3 text-right">Vol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/90">
                        {data.slice(0, 5).map((stock) => (
                            <tr key={stock.ticker}>
                                <td className="p-2 pl-3 font-semibold text-gray-800 truncate">{stock.ticker}</td>
                                <td className="p-2 text-gray-600 truncate">{stock.name}</td>
                                <td className="p-2 text-right font-medium text-gray-800">${parseFloat(stock.price).toFixed(2)}</td>
                                <td className={`p-2 text-right font-bold ${getRowColor(stock)}`}>
                                    {parseFloat(stock.changeAmount) >= 0 ? '+' : ''}{parseFloat(stock.changeAmount).toFixed(2)}
                                </td>
                                <td className={`p-2 text-right font-bold ${getRowColor(stock)}`}>{stock.changePercentage}</td>
                                <td className="p-2 pr-3 text-right font-medium text-gray-600">{formatVolume(stock.volume)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketCard;