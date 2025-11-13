import React, { useState } from 'react';
// --- THIS IS THE FIX ---
// Path changed from '../../components/market/MarketChart' to '../market/MarketChart'
import MarketChart from '../market/MarketChart';
import './MainChart.css';

const timeframes = [
    { label: '1D', points: 1 }, // Will show today vs. prev close
    { label: '5D', points: 5 },
    { label: '1M', points: 22 },
    { label: '6M', points: 126 },
    { label: 'YTD', points: 'YTD' },
    { label: '1Y', points: 252 },
    { label: '5Y', points: 1260 },
    { label: 'Max', points: 99999 },
];

const MainChart = ({ history, quote }) => {
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');

    const getChartData = () => {
        if (!history || history.length === 0) return { labels: [], prices: [] };

        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return { labels: [], prices: [] };

        let filteredHistory = [...history]; // Create a copy

        if (tf.label === '1D') {
            // For 1D, show previous close and current price
            return {
                labels: ['Previous Close', 'Current'],
                prices: [quote.previousClose, quote.currentPrice]
            };
        }

        if (tf.label === 'YTD') {
            const currentYear = new Date().getFullYear();
            filteredHistory = filteredHistory.filter(item => new Date(item.priceDate).getFullYear() === currentYear);
        } else if (tf.label !== 'Max') {
            const pointsToTake = Math.min(filteredHistory.length, tf.points);
            filteredHistory = filteredHistory.slice(-pointsToTake);
        }

        return {
            labels: filteredHistory.map(item => new Date(item.priceDate).toLocaleDateString()),
            prices: filteredHistory.map(item => item.closePrice)
        };
    };

    const chartData = getChartData();
    const isPos = quote.changeAmount >= 0;

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4">
            {/* Time-Range Selector */}
            <div className="timeframe-selector-group">
                {timeframes.map(tf => (
                    <button
                        key={tf.label}
                        onClick={() => setActiveTimeframe(tf.label)}
                        className={`timeframe-button ${activeTimeframe === tf.label ? 'active' : ''}`}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Line Chart */}
            <div className="h-[250px] md:h-[400px] mt-4">
                <MarketChart
                    chartData={chartData}
                    previousClose={quote.previousClose}
                    isPositive={isPos}
                />
            </div>
        </div>
    );
};

export default MainChart;