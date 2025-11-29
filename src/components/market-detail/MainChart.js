// src/components/market-detail/MainChart.js
import React, { useState, useMemo } from 'react';
import TradingViewChart from '../market/TradingViewChart';
import './MainChart.css';

const timeframes = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: 'YTD', type: 'ytd' },
    { label: '1Y', days: 365 },
    { label: '5Y', days: 1825 },
    { label: 'Max', days: 99999 },
];

const MainChart = ({ history, quote }) => {
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');

    // 1. Transform Data for TradingView
    // TradingView expects { time: 'YYYY-MM-DD', value: 123.45 } and MUST be sorted ascending
    const fullChartData = useMemo(() => {
        if (!history || history.length === 0) return [];
        // Clone and sort just in case
        return [...history]
            .sort((a, b) => new Date(a.priceDate) - new Date(b.priceDate))
            .map(item => ({
                time: item.priceDate,
                value: parseFloat(item.closePrice)
            }));
    }, [history]);

    // 2. Filter Data based on Timeframe
    const filteredData = useMemo(() => {
        if (fullChartData.length === 0) return [];

        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return fullChartData;

        const now = new Date();
        let cutoffDate = new Date();

        if (tf.type === 'ytd') {
            cutoffDate = new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
        } else {
            cutoffDate.setDate(now.getDate() - tf.days);
        }

        return fullChartData.filter(item => new Date(item.time) >= cutoffDate);
    }, [fullChartData, activeTimeframe]);

    // 3. Determine Chart Color (Green if ending higher than starting)
    const chartColor = useMemo(() => {
        if (filteredData.length < 2) return '#0ea5e9'; // Default Blue
        const startPrice = filteredData[0].value;
        const endPrice = filteredData[filteredData.length - 1].value;
        return endPrice >= startPrice ? '#22c55e' : '#ef4444'; // Green or Red
    }, [filteredData]);

    return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg p-4 transition-colors duration-300">
            {/* Time-Range Selector */}
            <div className="timeframe-selector-group mb-4">
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

            {/* TradingView Chart Area */}
            <div className="h-[300px] md:h-[400px] w-full">
                {filteredData.length > 0 ? (
                    <TradingViewChart
                        data={filteredData}
                        color={chartColor}
                        height={400}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                        No chart data available for this timeframe.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainChart;