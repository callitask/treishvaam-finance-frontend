import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    TimeScale
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    TimeScale
);

const MarketChart = ({ chartData, previousClose, isPositive }) => {
    if (!chartData || !chartData.prices || chartData.prices.length === 0) {
        return <div className="h-full flex items-center justify-center text-gray-300 text-[10px]">No data</div>;
    }

    const chartColor = isPositive ? '#16a34a' : '#dc2626';

    const data = {
        labels: chartData.labels,
        datasets: [
            {
                data: chartData.prices,
                borderColor: chartColor,
                borderWidth: 1.5,
                pointRadius: 0,
                pointHoverRadius: 3,
                pointBackgroundColor: chartColor,
                fill: true,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
                    gradient.addColorStop(0, isPositive ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)');
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    return gradient;
                },
                tension: 0.05,
            },
            {
                data: new Array(chartData.labels.length).fill(previousClose),
                borderColor: '#9ca3af',
                borderWidth: 1,
                borderDash: [2, 2],
                pointRadius: 0,
                fill: false,
                tooltip: { enabled: false }
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 }, // Disable animation for faster sidebar performance
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#374151',
                borderWidth: 1,
                padding: 4,
                titleFont: { size: 10 },
                bodyFont: { size: 10 },
                displayColors: false,
                callbacks: {
                    title: (items) => items[0].label,
                    label: (item) => item.datasetIndex === 0 ? `$${item.parsed.y.toFixed(2)}` : ''
                }
            }
        },
        scales: {
            x: { display: false },
            y: {
                position: 'right',
                beginAtZero: false,
                grace: '5%', // Automatic padding top/bottom for standard stock look
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: '#9ca3af',
                    font: { size: 9 },
                    maxTicksLimit: 4,
                    callback: (val) => Math.round(val)
                }
            }
        },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        layout: { padding: 0 }
    };

    return <Line data={data} options={options} />;
};

export default MarketChart;