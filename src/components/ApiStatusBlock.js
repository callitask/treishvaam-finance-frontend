import React, { useState } from 'react';
import { FaSync, FaTrash, FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronUp, FaClock } from 'react-icons/fa';
import { useCountdown } from '../hooks/useCountdown';

const ApiStatusBlock = ({ title, desc, logs, onRefresh, onFlush, nextRefreshTime }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFlushing, setIsFlushing] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);
    const { hours, minutes, seconds, isFinished } = useCountdown(nextRefreshTime);

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    const handleFlush = async (password, flushFn) => {
        setIsFlushing(true);
        try {
            await flushFn(password);
        } catch (error) {
            console.error("Flush failed:", error);
        }
        setIsFlushing(false);
    };

    const formatTime = (t) => t.toString().padStart(2, '0');
    const countdownText = isFinished
        ? "Due"
        : `${formatTime(hours)}h ${formatTime(minutes)}m`;

    const logsToShow = showAllLogs ? logs : logs.slice(0, 5); // Default show 5

    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        {title}
                        {nextRefreshTime && (
                            <span className="text-[10px] font-normal px-2 py-0.5 bg-gray-200 rounded-full text-gray-600 flex items-center gap-1">
                                <FaClock size={8} /> {countdownText}
                            </span>
                        )}
                    </h3>
                    {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
                </div>

                <div className="flex items-center space-x-1">
                    {onRefresh && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-1.5 text-sky-600 hover:bg-sky-100 rounded transition disabled:opacity-50"
                            title="Run Pipeline Now"
                        >
                            <FaSync size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        </button>
                    )}
                    {onFlush && (
                        <button
                            onClick={() => onFlush(handleFlush)}
                            disabled={isFlushing}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded transition disabled:opacity-50"
                            title="Flush Data"
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Scrollable Logs Container */}
            <div className="flex-1 min-h-[100px] bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col">
                <div className="overflow-y-auto max-h-48 p-2 space-y-2 custom-scrollbar">
                    {logsToShow.length > 0 ? logsToShow.map(log => (
                        <LogItem key={log.id} log={log} />
                    )) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">
                            No logs found.
                        </div>
                    )}
                </div>
            </div>

            {logs.length > 5 && (
                <button
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="text-xs text-center text-gray-500 hover:text-gray-800 mt-2 font-medium flex items-center justify-center gap-1 w-full"
                >
                    {showAllLogs ? 'Collapse' : `View ${logs.length - 5} older logs`}
                    {showAllLogs ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                </button>
            )}
        </div>
    );
};

const LogItem = ({ log }) => {
    const isSuccess = log.status === 'SUCCESS';
    // Format: "Dec 2, 10:30 PM"
    const dateStr = new Date(log.lastFetchTime).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });

    return (
        <div className={`text-xs border-l-2 pl-2 ${isSuccess ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex justify-between items-center mb-0.5">
                <span className={`font-bold ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                    {log.status}
                </span>
                <span className="text-[10px] text-gray-400">{dateStr}</span>
            </div>
            <div className="text-gray-600 leading-tight">
                <span className="font-semibold text-gray-500">{log.triggerSource}:</span> {log.details}
            </div>
        </div>
    );
};

export default ApiStatusBlock;