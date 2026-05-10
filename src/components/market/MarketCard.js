"use client";
/**
 * AI-CONTEXT:
 * Purpose: Top Gainers / Losers / Active Market Table widget.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Removed hardcoded `$` and injected `formatSmartPrice` to correctly display native asset currencies (INR, EUR, etc).
 * - EDITED: Added dark mode classes and Next.js `<Link>` routing.
 * - EDITED: Restored classic green-600 / red-600 color scheme.
 */
import React from 'react';
import Link from 'next/link';
import { formatSmartPrice, formatCompactNumber } from '../../utils/marketFormatter';

const MarketCard = ({ title, data, cardType }) => {
    if (!data || data.length === 0) return null;

    const isGainer = cardType === 'gainer';
    const isLoser = cardType === 'loser';

    const getRowColor = (stock) => {
        const change = parseFloat(stock.changeAmount || stock.change || 0);
        if (isGainer || (cardType === 'active' && change >= 0)) return 'text-green-600 dark:text-green-400';
        if (isLoser || (cardType === 'active' && change < 0)) return 'text-red-600 dark:text-red-400';
        return 'text-slate-800 dark:text-slate-200';
    };

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-sm overflow-hidden rounded-md transition-colors duration-300">
            <h4 className="font-bold text-sm p-3 border-b border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100">{title}</h4>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-xs">
                    <caption className="sr-only">{title} Data Table</caption>
                    <thead className="bg-slate-50 dark:bg-slate-900/50">
                        <tr className="text-left text-slate-500 dark:text-slate-400 uppercase font-medium text-[11px]">
                            <th scope="col" className="py-2 px-3 font-semibold">Symbol</th>
                            <th scope="col" className="py-2 px-3 font-semibold">Name</th>
                            <th scope="col" className="py-2 px-3 font-semibold text-right whitespace-nowrap">Price</th>
                            <th scope="col" className="py-2 px-3 font-semibold text-right whitespace-nowrap">Chg</th>
                            <th scope="col" className="py-2 px-3 font-semibold text-right whitespace-nowrap">%Chg</th>
                            <th scope="col" className="py-2 px-3 font-semibold text-right whitespace-nowrap">Vol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {data.slice(0, 5).map((stock) => {
                            const rawPrice = stock.price ?? stock.currentPrice ?? 0;
                            const rawChangeAmt = stock.changeAmount ?? stock.change ?? 0;
                            const rawChangePct = stock.changePercentage ?? stock.changePercent ?? 0;

                            return (
                                <tr key={stock.ticker} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-200 truncate max-w-[80px]">
                                        <Link href={`/market/${encodeURIComponent(stock.ticker)}`} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                                            {stock.ticker}
                                        </Link>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{stock.name}</td>

                                    {/* DYNAMIC CURRENCY APPLICATION */}
                                    <td className="py-2 px-3 text-right font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                        {formatSmartPrice(rawPrice, stock.currency, stock.ticker)}
                                    </td>

                                    <td className={`py-2 px-3 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                        {parseFloat(rawChangeAmt) >= 0 ? '+' : ''}{parseFloat(rawChangeAmt).toFixed(2)}
                                    </td>
                                    <td className={`py-2 px-3 text-right font-bold whitespace-nowrap ${getRowColor(stock)}`}>
                                        {rawChangePct}
                                    </td>
                                    <td className="py-2 px-3 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                        {formatCompactNumber(stock.volume)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MarketCard;