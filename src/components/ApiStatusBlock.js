import React, { useState } from 'react';
import { FaSync, FaTrash, FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useCountdown } from '../hooks/useCountdown';

const ApiStatusBlock = ({ title, logs, onRefresh, onFlush, nextRefreshTime }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFlushing, setIsFlushing] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);
    const { hours, minutes, seconds, isFinished } = useCountdown(nextRefreshTime);

    const handleRefresh = async () => {
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
            // Optionally, show an error toast to the user
        }
        setIsFlushing(false);
    };

    const formatTime = (t) => t.toString().padStart(2, '0');

    const countdownText = isFinished
        ? "Refresh due"
        : `${formatTime(hours)}h ${formatTime(minutes)}m ${formatTime(seconds)}s`;

    const logsToShow = showAllLogs ? logs : logs.slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="p-2 text-sm text-sky-600 bg-sky-100 hover:bg-sky-200 rounded-full transition disabled:opacity-50 disabled:cursor-wait"
                        title="Refresh Data Now"
                    >
                        <FaSync className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={() => onFlush(handleFlush)}
                        disabled={isFlushing}
                        className="p-2 text-sm text-red-600 bg-red-100 hover:bg-red-200 rounded-full transition disabled:opacity-50"
                        title="Flush Cached Data"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            {nextRefreshTime && (
                 <p className="text-xs text-gray-500 mb-4">
                    Auto-refresh in: <span className="font-semibold text-gray-600">{countdownText}</span>
                </p>
            )}

            <div className="space-y-3">
                {logsToShow.length > 0 ? logsToShow.map(log => (
                    <LogItem key={log.id} log={log} />
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">No logs available.</p>
                )}
            </div>

            {logs.length > 3 && (
                <button 
                    onClick={() => setShowAllLogs(!showAllLogs)}
                    className="text-sm text-sky-600 font-semibold mt-4 flex items-center"
                >
                    {showAllLogs ? 'Show Recent Logs' : 'Show All Logs'}
                    {showAllLogs ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>
            )}
        </div>
    );
};

const LogItem = ({ log }) => {
    const isSuccess = log.status === 'SUCCESS';
    const formatDate = (dateString) => new Date(dateString).toLocaleString();

    return (
        <div className="text-xs border-l-4 pl-3" style={{ borderColor: isSuccess ? '#10B981' : '#EF4444' }}>
            <div className="flex items-center font-semibold" style={{ color: isSuccess ? '#059669' : '#DC2626' }}>
                {isSuccess ? <FaCheckCircle className="mr-2" /> : <FaExclamationCircle className="mr-2" />}
                {log.status} - <span className="font-normal text-gray-500 ml-1">{formatDate(log.lastFetchTime)}</span>
            </div>
            <p className="text-gray-600 mt-1">
                Source: <span className="font-medium">{log.triggerSource}</span>. Details: {log.details}
            </p>
        </div>
    );
};


export default ApiStatusBlock;
