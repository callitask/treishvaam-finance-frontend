import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { getHistoricalData } from '../../apiConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const MarketChart = ({ ticker, chartTitle }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticker) return;

        const fetchChartData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getHistoricalData(ticker);
                const timeSeries = response.data ? response.data['Time Series (Daily)'] : null;
                
                if (timeSeries) {
                    const dates = Object.keys(timeSeries).slice(0, 30).reverse();
                    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));

                    if (dates.length === 0) {
                        setError(`No historical data points found for ${ticker}.`);
                        return;
                    }

                    const formattedDates = dates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

                    setChartData({
                        labels: formattedDates,
                        datasets: [
                            {
                                label: `Price ($)`,
                                data: prices,
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: (context) => {
                                    const ctx = context.chart.ctx;
                                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
                                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                                    return gradient;
                                },
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 5,
                                pointBackgroundColor: 'rgb(59, 130, 246)',
                            },
                        ],
                    });
                } else {
                    setError(response.data.message || `Invalid data format received for ${ticker}.`);
                }

            } catch (err) {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Could not connect to the API. It may be temporarily unavailable.');
                }
                console.error("Failed to fetch chart data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [ticker]);

    if (loading) {
        return <div className="p-4 text-center text-slate-500 text-xs">Loading Chart...</div>;
    }
    
    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="font-semibold text-sm text-gray-800">{chartTitle || ticker}</p>
                <div className="text-red-600 text-xs font-semibold mt-2">{error}</div>
            </div>
        );
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: `${chartTitle || ticker} - Last 30 Days`,
                font: { size: 16, weight: '600' },
                color: '#1f2937',
                padding: { top: 10, bottom: 20 }
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Date',
                    font: { size: 12, weight: '500' },
                    color: '#6b7280'
                },
                ticks: { 
                    display: true,
                    font: { size: 10 },
                    color: '#6b7280',
                    maxTicksLimit: 6
                },
                grid: { display: false }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Price (USD)',
                    font: { size: 12, weight: '500' },
                    color: '#6b7280'
                },
                ticks: {
                    font: { size: 10 },
                    color: '#6b7280',
                    callback: (value) => `$${value.toFixed(0)}`
                },
                 grid: {
                    color: '#e5e7eb',
                    drawBorder: false,
                }
            }
        }
    };

    return (
        <div className="p-4" style={{ height: '220px' }}>
            {chartData ? <Line options={options} data={chartData} /> : null}
        </div>
    );
};

export default MarketChart;