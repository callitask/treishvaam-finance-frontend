"use client";
import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './ComparisonCarousel.css';

/**
 * AI-CONTEXT:
 * Purpose: Market detail comparison carousel.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link.
 * - EDITED: Applied Zero-Trust data mapping. Safely extracts `peers` from multiple possible payload locations and defends against property variations (`changePercent` vs `changePercentage`, `currentPrice` vs `price`).
 */

const formatChange = (change) => {
    if (change == null || isNaN(change)) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
};

const getChangeColor = (change) => {
    if (change == null || isNaN(change)) return 'text-gray-500 dark:text-gray-400';
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
};

const PeerCard = ({ peer }) => {
    // Defensively map payload variations
    const change = peer.changePercent ?? peer.changePercentage ?? 0;
    const price = peer.currentPrice ?? peer.price ?? 0;
    const color = getChangeColor(change);

    return (
        <Link href={`/market/${encodeURIComponent(peer.ticker)}`} className="carousel-card block dark:bg-slate-800 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{peer.name}</h4>
            <div className="text-lg font-bold text-gray-900 dark:text-white my-1">
                {price.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-medium ${color}`}>
                {change >= 0 ? <TrendingUp size={16} className="inline mr-1" /> : <TrendingDown size={16} className="inline mr-1" />}
                {formatChange(change)}
            </div>
        </Link>
    );
}

const ComparisonCarousel = ({ peers, marketData, quoteData }) => {
    // Scan all possible locations where the backend might have nested the peers array
    const activePeers = peers || marketData?.peers || quoteData?.peers || [];
    
    if (!activePeers || activePeers.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-4 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Compare to</h2>
            <div className="carousel-container">
                {activePeers.map(peer => (
                    <PeerCard key={peer.ticker} peer={peer} />
                ))}
            </div>
        </div>
    );
};

export default ComparisonCarousel;