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
import { sub, startOfDay, parse, isValid } from 'date-fns';
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
    if (!num || num === 0) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toFixed(2);
};

const formatStat = (num) => {
    if (num === null || num === undefined) return '-';
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getChangeColor = (change) => {
    if (change > 0) return 'text-[#137333]'; // Google Finance Green
    if (change < 0) return 'text-[#a50e0e]'; // Google Finance Red
    return 'text-[#5f6368]'; // Gray
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
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getWidgetData(ticker);
                if (res.data && res.data.quoteData) setWidgetData(res.data);
                else setError('No data');
            } catch (e) { setError('Unavailable'); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [ticker]);

    const processedData = useMemo(() => {
        if (!widgetData?.historicalData?.length) return null;
        let data = widgetData.historicalData;
        const now = startOfDay(new Date());
        const frame = timeframes.find(t => t.label === activeTimeframe);

        if (frame && frame.label !== 'Max') {
            const cutoff = frame.days === 'YTD' ? startOfDay(new Date(now.getFullYear(), 0, 1)) : sub(now, { days: frame.days });
            data = data.filter(p => {
                // Try standard Date parse first, typical for YYYY-MM-DD
                let date = new Date(p.priceDate);
                // If invalid, try explicit parsing (sometimes needed for Safari/older browsers if format varies)
                if (!isValid(date)) date = parse(p.priceDate, 'yyyy-MM-dd', new Date());
                return isValid(date) && date >= cutoff;
            });
        }

        if (data.length === 0) return null;

        return {
            labels: data.map(p => p.priceDate),
            datasets: [{
                data: data.map(p => p.closePrice),
                borderColor: data[data.length - 1].closePrice >= data[0].closePrice ? '#137333' : '#a50e0e',
                borderWidth: 1.5,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                    const color = data[data.length - 1].closePrice >= data[0].closePrice ? '19, 115, 51' : '165, 14, 14';
                    gradient.addColorStop(0, `rgba(${color}, 0.2)`);
                    gradient.addColorStop(1, `rgba(${color}, 0.0)`);
                    return gradient;
                },
                tension: 0.1,
                pointRadius: 0,
                pointHitRadius: 10,
            }]
        };
    }, [widgetData, activeTimeframe]);

    const options = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: false, title: false, tooltip: { mode: 'index', intersect: false } },
        scales: {
            x: { display: false }, // Hide X-axis labels for cleaner look
            y: {
                display: true,
                position: 'right',
                grid: { color: '#f1f3f4', drawBorder: false },
                ticks: { color: '#70757a', font: { size: 11 } }
            }
        }
    }), []);

    if (loading) return <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Loading...</div>;
    if (error || !widgetData) return <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Data unavailable</div>;

    const { quoteData } = widgetData;
    const changeColor = getChangeColor(quoteData.changeAmount);

    return (
        <div className="font-sans text-[#202124]">
            {/* Header */}
            <div className="mb-4 px-1">
                <div className="text-lg font-medium">{chartTitle}</div>
                <div className="flex items-baseline mt-1">
                    <span className="text-[28px] font-normal leading-8">{formatStat(quoteData.currentPrice)}</span>
                    <span className="text-sm text-[#5f6368] ml-1 font-normal">USD</span>
                    <span className={`ml-2 text-sm font-medium ${changeColor}`}>
                        {quoteData.changeAmount > 0 ? '+' : ''}{formatStat(quoteData.changeAmount)} ({formatStat(quoteData.changePercent)}%)
                    </span>
                </div>
                <div className="text-xs text-[#70757a] mt-1">
                    {new Date(quoteData.lastUpdated).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC · Market Closed
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#e8eaed] mb-4 overflow-x-auto no-scrollbar">
                {timeframes.map(t => (
                    <button key={t.label} onClick={() => setActiveTimeframe(t.label)}
                        className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors relative top-[1px]
                            ${activeTimeframe === t.label ? 'text-[#1967d2] border-b-[3px] border-[#1967d2]' : 'text-[#5f6368] hover:text-[#202124]'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[200px] mb-6">
                {processedData ? <Line data={processedData} options={options} /> : <div className="h-full flex items-center justify-center text-sm text-gray-500">No chart data</div>}
            </div>

            {/* Compact Key Stats Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs leading-5">
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">Previous close</span>
                    <span className="text-[#202124]">{formatStat(quoteData.previousClose)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">Day range</span>
                    <span className="text-[#202124]">{formatStat(quoteData.dayLow)} - {formatStat(quoteData.dayHigh)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">Year range</span>
                    <span className="text-[#202124]">{formatStat(quoteData.fiftyTwoWeekLow)} - {formatStat(quoteData.fiftyTwoWeekHigh)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">Market cap</span>
                    <span className="text-[#202124]">{formatMarketCap(quoteData.marketCap)} USD</span>
                </div>
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">P/E ratio</span>
                    <span className="text-[#202124]">{formatStat(quoteData.peRatio)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e8eaed] py-1">
                    <span className="text-[#5f6368]">Dividend yield</span>
                    <span className="text-[#202124]">{formatStat(quoteData.dividendYield)}%</span>
                </div>
            </div>
        </div>
    );
};

export default MarketChart;