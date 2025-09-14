import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getHistoricalData } from '../../apiConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

                    setChartData({
                        labels: dates,
                        datasets: [
                            {
                                label: `Price ($)`,
                                data: prices,
                                borderColor: prices[prices.length - 1] >= prices[0] ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
                                backgroundColor: prices[prices.length - 1] >= prices[0] ? 'rgba(22, 163, 74, 0.5)' : 'rgba(220, 38, 38, 0.5)',
                                tension: 0.1,
                                pointRadius: 0,
                            },
                        ],
                    });
                } else {
                    setError(response.data.message || `Invalid data format received for ${ticker}.`);
                }

            } catch (err) {
                // This logic now correctly reads the specific error from the backend response.
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
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: chartTitle || `${ticker} - Last 30 Days`,
                font: { size: 14, weight: 'bold' },
                color: '#334155',
            },
        },
        scales: {
            x: { ticks: { display: false }, grid: { display: false } },
            y: { ticks: { font: { size: 10 } } }
        }
    };

    return (
        <div className="p-2">
            {chartData ? <Line options={options} data={chartData} /> : null}
        </div>
    );
};

export default MarketChart;