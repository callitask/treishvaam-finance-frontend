"use client";
/**
 * AI-CONTEXT:
 * Purpose: Renders the historical price chart for the asset.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Fixed prop name from `history` to `historicalData` to correctly receive the API payload from MarketDetailPage.
 * - EDITED: Added Zero-Trust data mapping for chart payload. Scans for variations of date (`priceDate`, `date`, `time`) and close values (`closePrice`, `close`, `value`) to prevent silent empty-chart failures caused by JSON flattening.
 */
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

const MainChart = ({ historicalData, marketData }) => {
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');

    // 1. Transform Data for TradingView (Defensive extraction)
    const fullChartData = useMemo(() => {
        const activeData = historicalData || marketData?.historicalData || [];
        if (!activeData || activeData.length === 0) return [];
        
        return [...activeData]
            .map(item => {
                // Defensively scan for date and price keys
                const rawTime = item.priceDate || item.date || item.timestamp || item.time;
                const rawValue = item.closePrice ?? item.close ?? item.value;
                
                return {
                    time: rawTime,
                    value: parseFloat(rawValue)
                };
            })
            .filter(item => item.time && !isNaN(item.value)) // Safely drop unparseable nodes
            .sort((a, b) => new Date(a.time) - new Date(b.time));
    }, [historicalData, marketData]);

    // 2. Filter Data based on Timeframe
    const filteredData = useMemo(() => {
        if (fullChartData.length === 0) return [];

        const tf = timeframes.find(t => t.label === activeTimeframe);
        if (!tf) return fullChartData;

        const now = new Date();
        let cutoffDate = new Date();

        if (tf.type === 'ytd') {
            cutoffDate = new Date(now.getFullYear(), 0, 1);
        } else {
            cutoffDate.setDate(now.getDate() - tf.days);
        }

        return fullChartData.filter(item => new Date(item.time) >= cutoffDate);
    }, [fullChartData, activeTimeframe]);

    // 3. Determine Chart Color
    const chartColor = useMemo(() => {
        if (filteredData.length < 2) return '#0ea5e9'; // Default Blue
        const startPrice = filteredData[0].value;
        const endPrice = filteredData[filteredData.length - 1].value;
        return endPrice >= startPrice ? '#16a34a' : '#dc2626'; // Green or Red
    }, [filteredData]);

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-lg p-4 transition-colors duration-300">
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

            <div className="h-[300px] md:h-[400px] w-full">
                {filteredData.length > 0 ? (
                    <TradingViewChart
                        data={filteredData}
                        color={chartColor}
                        height={400}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                        No chart data available for this timeframe.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MainChart;