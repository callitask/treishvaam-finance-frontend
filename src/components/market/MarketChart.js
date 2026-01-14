import React, { useState, useEffect } from 'react';
import TradingViewChart from './TradingViewChart';
import { getWidgetData } from '../../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: A lightweight sparkline chart for the Top Movers card.
 * Changes:
 * - Replaced Chart.js with Lightweight Charts (TradingView) to eliminate 60KB duplicate dependency.
 * - Implemented internal data fetching to fix "Prop Mismatch" bug (TopMoversCard passed 'ticker', component expected 'data').
 * - Added graceful error handling for missing data.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - REFACTORED:
 * • Replaced react-chartjs-2 with TradingViewChart
 * • Added internal API fetching logic
 * • Reason: Performance (Bundle Size) + Bug Fix
 */

const MarketChart = ({ ticker }) => {
    const [chartData, setChartData] = useState([]);
    const [color, setColor] = useState('#22c55e'); // Default Green
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!ticker) return;
            setLoading(true);
            try {
                // Reuse the same widget data endpoint
                const response = await getWidgetData(ticker);
                if (isMounted && response.data && response.data.historicalData) {
                    const hist = response.data.historicalData;

                    // 1. Transform for TradingView: { time: 'YYYY-MM-DD', value: 123.45 }
                    const formattedData = hist
                        .map(item => ({
                            time: item.priceDate,
                            value: parseFloat(item.closePrice)
                        }))
                        .sort((a, b) => new Date(a.time) - new Date(b.time));

                    setChartData(formattedData);

                    // 2. Determine Color (Green/Red)
                    if (formattedData.length > 1) {
                        const first = formattedData[0].value;
                        const last = formattedData[formattedData.length - 1].value;
                        setColor(last >= first ? '#22c55e' : '#ef4444');
                    }
                }
            } catch (err) {
                console.warn(`Sparkline load failed for ${ticker}`, err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false; };
    }, [ticker]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-50/50 animate-pulse rounded">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                No Data
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <TradingViewChart
                data={chartData}
                color={color}
                height={96} // Matches the h-24 container in TopMoversCard
            />
        </div>
    );
};

export default MarketChart;