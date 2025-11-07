import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeSeriesScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { sub, startOfDay } from 'date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { getWidgetData } from '../../apiConfig';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeSeriesScale,
    annotationPlugin
);

const formatMarketCap = (num) => {
    if (!num || num === 0) return 'N/A';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toFixed(2);
};

const formatStat = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return Number(num).toFixed(2);
};

const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
};

const timeframes = [
    { label: '1M', days: 30 },
    { label: '6M', days: 180 },
    { label: 'YTD', days: 'YTD' },
    { label: '1Y', days: 365 },
    { label: '5Y', days: 365 * 5 },
    { label: 'Max', days: 99999 },
];

const MarketChart = ({ ticker, chartTitle }) => {
    const [widgetData, setWidgetData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTimeframe, setActiveTimeframe] = useState('1Y');

    useEffect(() => {
        if (!ticker) return;

        const fetchWidgetData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getWidgetData(ticker);
                if (response.data && response.data.quoteData) {
                    setWidgetData(response.data);
                } else {
                    setError(`Incomplete data for ${ticker}.`);
                }
            } catch (err) {
                setError('Market data is currently unavailable.');
                console.error("Failed to fetch widget data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWidgetData();
    }, [ticker]);

    const processedChartData = useMemo(() => {
        if (!widgetData || !widgetData.historicalData) return null;

        const { historicalData } = widgetData;
        let filteredData = historicalData;
        const now = startOfDay(new Date());
        const selectedFrame = timeframes.find(t => t.label === activeTimeframe);

        if (selectedFrame) {
            let cutoffDate;
            if (selectedFrame.days === 'YTD') {
                cutoffDate = startOfDay(new Date(now.getFullYear(), 0, 1));
            } else {
                cutoffDate = startOfDay(sub(now, { days: selectedFrame.days }));
            }

            // UPDATED: More robust date filtering to prevent 't.split' errors
            filteredData = historicalData.filter(p => {
                if (!p.priceDate) return false;
                // Use standard JS Date parsing which is robust for YYYY-MM-DD strings
                return new Date(p.priceDate) >= cutoffDate;
            });
        }

        const labels = filteredData.map(p => p.priceDate);
        const prices = filteredData.map(p => p.closePrice);
        const firstPrice = prices.length > 0 ? prices[0] : 0;
        const lastPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
        const chartColor = lastPrice >= firstPrice ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)';
        const chartBgColor = lastPrice >= firstPrice ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)';

        return {
            labels,
            datasets: [{
                label: 'Price ($)',
                data: prices,
                borderColor: chartColor,
                backgroundColor: chartBgColor,
                borderWidth: 2,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointBackgroundColor: chartColor,
            }],
        };
    }, [widgetData, activeTimeframe]);

    const chartOptions = useMemo(() => {
        if (!widgetData || !widgetData.quoteData) return {};
        const prevClose = widgetData.quoteData.previousClose;
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: { label: (context) => `Price: $${Number(context.parsed.y).toFixed(2)}` }
                },
                annotation: {
                    annotations: {
                        prevCloseLine: {
                            type: 'line',
                            yMin: prevClose,
                            yMax: prevClose,
                            borderColor: 'rgb(156, 163, 175)',
                            borderWidth: 1,
                            borderDash: [6, 6],
                            label: {
                                content: `Prev: ${formatStat(prevClose)}`,
                                enabled: true,
                                position: 'start',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                color: '#6b7280',
                                font: { size: 10 },
                                yAdjust: -10,
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'timeseries',
                    time: { unit: 'month', displayFormats: { month: 'MMM yy' } },
                    ticks: { font: { size: 10 }, color: '#6b7280', maxTicksLimit: 6 },
                    grid: { display: false }
                },
                y: {
                    display: true,
                    ticks: { font: { size: 10 }, color: '#6b7280' },
                    grid: { color: '#e5e7eb', drawBorder: false }
                }
            }
        };
    }, [widgetData]);

    if (loading) return <div className="p-4 text-center text-slate-500 text-sm h-96 flex items-center justify-center">Loading Widget...</div>;
    if (error || !widgetData) return <div className="p-4 text-center text-red-500 text-sm h-96 flex items-center justify-center">{error}</div>;

    const { quoteData } = widgetData;
    const changeColor = getChangeColor(quoteData.changeAmount);

    return (
        <div className="p-4 w-full">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{chartTitle} ({ticker})</h3>
                <div className="flex items-baseline space-x-2 mt-1">
                    <h2 className="text-3xl font-bold text-gray-900">{formatStat(quoteData.currentPrice)}</h2>
                    <span className="text-base font-semibold text-gray-600">USD</span>
                </div>
                <div className={`text-sm font-semibold ${changeColor} flex items-center mt-1`}>
                    <span>{quoteData.changeAmount >= 0 ? '+' : ''}{formatStat(quoteData.changeAmount)}</span>
                    <span className="ml-1">({quoteData.changePercent >= 0 ? '+' : ''}{formatStat(quoteData.changePercent)}%)</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    Updated: {new Date(quoteData.lastUpdated).toLocaleString()}
                </div>
            </div>

            <div className="flex items-center space-x-1 border-b border-gray-100 mb-4 overflow-x-auto">
                {timeframes.map((frame) => (
                    <button
                        key={frame.label}
                        onClick={() => setActiveTimeframe(frame.label)}
                        className={`text-xs font-medium py-2 px-3 whitespace-nowrap transition-colors ${activeTimeframe === frame.label
                            ? 'border-b-2 border-sky-600 text-sky-700'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        {frame.label}
                    </button>
                ))}
            </div>

            <div className="h-[250px] w-full mb-6">
                {processedChartData && <Line options={chartOptions} data={processedChartData} />}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">Open</span>
                    <span className="font-medium">{formatStat(quoteData.openPrice)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">High</span>
                    <span className="font-medium">{formatStat(quoteData.dayHigh)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">Low</span>
                    <span className="font-medium">{formatStat(quoteData.dayLow)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">Prev. Close</span>
                    <span className="font-medium">{formatStat(quoteData.previousClose)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">Mkt Cap</span>
                    <span className="font-medium">{formatMarketCap(quoteData.marketCap)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">P/E Ratio</span>
                    <span className="font-medium">{formatStat(quoteData.peRatio)}</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">Div Yield</span>
                    <span className="font-medium">{formatStat(quoteData.dividendYield)}%</span>
                </div>
                <div className="flex justify-between py-1">
                    <span className="text-gray-500">52W High</span>
                    <span className="font-medium">{formatStat(quoteData.fiftyTwoWeekHigh)}</span>
                </div>
            </div>
        </div>
    );
};

export default MarketChart;