import React from 'react';

const MarketCard = ({ title, data, cardType }) => {
    // Helper function to format the numbers and determine color
    const formatChange = (value, type = 'change') => {
        const num = parseFloat(value);
        if (isNaN(num)) return { text: value, color: 'text-gray-800' };

        const color = num >= 0 ? 'text-green-600' : 'text-red-600';
        let text = value;

        if (type === 'percentage') {
            text = `${num.toFixed(2)}%`;
        } else if (type === 'price') {
            text = `$${num.toFixed(2)}`;
        } else if (type === 'value') {
             // Abbreviate large numbers for volume/value
            if (num > 1_000_000_000) {
                text = `$${(num / 1_000_000_000).toFixed(2)}B`;
            } else if (num > 1_000_000) {
                text = `$${(num / 1_000_000).toFixed(2)}M`;
            } else if (num > 1_000) {
                text = `$${(num / 1_000).toFixed(2)}K`;
            } else {
                text = `$${num.toFixed(2)}`;
            }
        } else { // 'change' amount
             text = num.toFixed(2);
        }

        return { text, color };
    };
    
    // Define headers based on card type
    const headers = {
        gainer: ['Company', 'Price', 'Change', '%Gain'],
        loser: ['Company', 'Price', 'Change', '%Loss'],
        active: ['Company', 'Price', 'Change', 'Value (USD)']
    };

    const currentHeaders = headers[cardType];

    const renderRow = (item, index) => {
        const price = formatChange(item.price, 'price');
        const changeAmount = formatChange(item.change_amount, 'change');
        const changePercent = formatChange(item.change_percentage, 'percentage');
        const volume = formatChange(item.volume, 'value');

        // Determine which value to show in the last column based on card type
        const lastColumnValue = cardType === 'active' ? volume : changePercent;
        const lastColumnColor = cardType === 'active' ? changeAmount.color : lastColumnValue.color;


        return (
            <tr key={item.ticker || index}>
                <td className="py-2.5 px-3 text-sm font-semibold text-gray-800 text-left truncate">{item.ticker}</td>
                <td className="py-2.5 px-3 text-sm font-medium text-gray-900 text-right">{price.text}</td>
                <td className={`py-2.5 px-3 text-sm font-bold text-right ${changeAmount.color}`}>{changeAmount.text}</td>
                <td className={`py-2.5 px-3 text-sm font-bold text-right ${lastColumnColor}`}>{lastColumnValue.text}</td>
            </tr>
        );
    };

    return (
        <div className="bg-white border border-gray-200/90 rounded-lg shadow-sm flex flex-col h-full">
            {/* Card Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-200/90">
                <h3 className="font-bold text-base text-gray-900 uppercase">{title}</h3>
                <div className="relative">
                    <select disabled className="bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-sky-500 focus:border-sky-500 block w-full pl-2 pr-7 py-1 cursor-not-allowed opacity-60">
                        {cardType === 'active' ? <option>US 🇺🇸</option> : <option>All</option>}
                    </select>
                </div>
            </div>
            
            {/* Table */}
            <div className="flex-grow overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                        <tr>
                            {currentHeaders.map(header => (
                                <th key={header} scope="col" className={`py-2 px-3 ${header !== 'Company' ? 'text-right' : 'text-left'}`}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 5).map(renderRow)}
                    </tbody>
                </table>
            </div>

            {/* Card Footer */}
            <div className="p-2 border-t border-gray-200/90 mt-auto">
                <button disabled className="w-full text-center text-sm font-semibold text-sky-700 py-1 rounded-md hover:bg-sky-50 cursor-not-allowed opacity-60">
                    + See all {title}
                </button>
            </div>
        </div>
    );
};

export default MarketCard;
