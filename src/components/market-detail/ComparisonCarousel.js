import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './ComparisonCarousel.css';

// Helper to format change
const formatChange = (change) => {
    if (change == null || isNaN(change)) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
};

// Helper to determine color
const getChangeColor = (change) => {
    if (change == null || isNaN(change)) return 'text-gray-500';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
};

const PeerCard = ({ peer }) => {
    const change = peer.changePercent || 0;
    const color = getChangeColor(change);

    return (
        <Link to={`/market/${encodeURIComponent(peer.ticker)}`} className="carousel-card">
            <h4 className="text-sm font-semibold text-gray-800 truncate">{peer.name}</h4>
            <div className="text-lg font-bold text-gray-900 my-1">
                {peer.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-medium ${color}`}>
                {change >= 0 ? <TrendingUp size={16} className="inline mr-1" /> : <TrendingDown size={16} className="inline mr-1" />}
                {formatChange(change)}
            </div>
        </Link>
    );
}

const ComparisonCarousel = ({ peers }) => {
    if (!peers || peers.length === 0) return null;

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Compare to</h2>
            <div className="carousel-container">
                {peers.map(peer => (
                    <PeerCard key={peer.ticker} peer={peer} />
                ))}
            </div>
        </div>
    );
};

export default ComparisonCarousel;