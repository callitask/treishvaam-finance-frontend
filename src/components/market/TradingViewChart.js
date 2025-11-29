// src/components/market/TradingViewChart.js
import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineStyle } from 'lightweight-charts';
import { useTheme } from '../../context/ThemeContext';

const TradingViewChart = ({ data, color, height = 300 }) => {
    const chartContainerRef = useRef();
    const chartInstance = useRef(null);
    const { theme } = useTheme();

    const isDark = theme === 'dark';
    const backgroundColor = 'transparent';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';
    const lineColor = color || '#0ea5e9';
    const areaTopColor = lineColor;
    const areaBottomColor = isDark ? 'rgba(15, 23, 42, 0)' : 'rgba(255, 255, 255, 0)';

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup previous instance
        if (chartInstance.current) {
            chartInstance.current.remove();
            chartInstance.current = null;
        }

        try {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor: textColor,
                    fontFamily: "'Inter', sans-serif",
                },
                grid: {
                    vertLines: { color: 'transparent' },
                    horzLines: { color: gridColor },
                },
                width: chartContainerRef.current.clientWidth,
                height: height,
                timeScale: {
                    borderVisible: false,
                    timeVisible: true,
                    secondsVisible: false,
                    fixLeftEdge: true,
                    fixRightEdge: true,
                },
                rightPriceScale: {
                    borderVisible: false,
                    scaleMargins: { top: 0.2, bottom: 0.1 },
                },
                crosshair: {
                    vertLine: {
                        labelVisible: false,
                        style: LineStyle.Solid,
                        color: isDark ? '#475569' : '#cbd5e1',
                    },
                    horzLine: {
                        labelVisible: true,
                        style: LineStyle.Solid,
                        color: isDark ? '#475569' : '#cbd5e1',
                    }
                },
                handleScale: { mouseWheel: false },
            });

            chartInstance.current = chart;

            const newSeries = chart.addAreaSeries({
                lineColor: lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
                lineWidth: 2,
                priceLineVisible: false,
            });

            // --- DATA NORMALIZATION & SORTING ---
            if (data && data.length > 0) {
                const cleanData = data
                    .map(item => {
                        let timeVal = item.time;
                        // Handle Java LocalDate Array [yyyy, mm, dd]
                        if (Array.isArray(timeVal)) {
                            const y = timeVal[0];
                            const m = timeVal[1].toString().padStart(2, '0');
                            const d = timeVal[2].toString().padStart(2, '0');
                            timeVal = `${y}-${m}-${d}`;
                        }

                        // Ensure value is a number
                        const val = parseFloat(item.value);
                        if (isNaN(val)) return null;

                        return { time: timeVal, value: val };
                    })
                    .filter(item => item !== null) // Remove bad data
                    // Deduplicate by time to prevent library crash
                    .reduce((acc, current) => {
                        const x = acc.find(item => item.time === current.time);
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            return acc;
                        }
                    }, [])
                    // Strictly Sort by Time string (YYYY-MM-DD sorts correctly alphabetically)
                    .sort((a, b) => (a.time > b.time ? 1 : -1));

                if (cleanData.length > 0) {
                    newSeries.setData(cleanData);
                    chart.timeScale().fitContent();
                }
            }

            const handleResize = () => {
                if (chartContainerRef.current && chartInstance.current) {
                    chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartInstance.current) {
                    chartInstance.current.remove();
                    chartInstance.current = null;
                }
            };

        } catch (err) {
            console.error("TradingView Chart Error:", err);
        }
    }, [data, height, isDark, lineColor, textColor, gridColor, areaTopColor, areaBottomColor, backgroundColor]);

    return <div ref={chartContainerRef} className="w-full relative" />;
};

export default TradingViewChart;