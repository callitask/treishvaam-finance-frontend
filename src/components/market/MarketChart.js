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

                if (response && response.data && Array.isArray(response.data.historical)) {
                    const historicalData = response.data.historical.slice(0, 30).reverse(); 
                    
                    if (historicalData.length === 0) {
                        setError(`No historical data found for ${ticker}.`);
                        return;
                    }

                    setChartData({
                        labels: historicalData.map(data => data.date),
                        datasets: [
                            {
                                label: `${ticker} Price ($)`,
                                data: historicalData.map(data => data.close),
                                borderColor: 'rgb(59, 130, 246)',
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                tension: 0.1,
                            },
                        ],
                    });
                } else {
                    console.error("Unexpected API response structure:", response.data);
                    setError(`Invalid data format received for ${ticker}.`);
                }

            } catch (err) {
                console.error("Failed to fetch chart data:", err);
                setError('Could not fetch chart data. The API might be unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [ticker]);

    if (loading) return <div className="p-4 text-center text-slate-500 text-xs">Loading Chart...</div>;
    if (error) return <div className="p-4 text-center text-red-600 text-xs font-semibold">{error}</div>;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                // Use the chartTitle prop if provided, otherwise default to the ticker
                text: chartTitle || `${ticker} - Last 30 Days`,
            },
        },
    };

    return (
        <div className="p-2 border-t mt-2">
            {chartData ? <Line options={options} data={chartData} /> : null}
        </div>
    );
};

export default MarketChart;