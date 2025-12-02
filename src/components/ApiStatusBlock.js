import React, { useState } from 'react';
import { FaSync, FaTrash, FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronUp, FaClock, FaTerminal, FaHistory } from 'react-icons/fa';
import { useCountdown } from '../hooks/useCountdown';

// Helper to parse Java LocalDateTime arrays [2025, 12, 2, 10, 0, 0] or ISO strings
const parseJavaDate = (dateData) => {
    if (!dateData) return null;
    if (Array.isArray(dateData)) {
        const [year, month, day, hour, minute, second] = dateData;
        // JS Date month is 0-indexed (0=Jan, 11=Dec)
        return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
    }
    return new Date(dateData);
};

const ApiStatusBlock = ({ title, desc, logs, onRefresh, onFlush, nextRefreshTime }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFlushing, setIsFlushing] = useState(false);
    const [showAllLogs, setShowAllLogs] = useState(false);

    // FIX: Removed unused 'seconds'
    const { hours, minutes, isFinished } = useCountdown(nextRefreshTime);

    // Get the most recent log for the header status
    const latestLog = logs && logs.length > 0 ? logs[0] : null;
    const isHealthy = latestLog?.status === 'SUCCESS';
    const isPending = latestLog?.status === 'PENDING';

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        await onRefresh();
        // Keep spinning briefly to show interaction
        setTimeout(() => setIsRefreshing(false), 1000);
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
        ? "Due Now"
        : `${formatTime(hours)}h ${formatTime(minutes)}m`;

    const logsToShow = showAllLogs ? logs : logs.slice(0, 5);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full transition-all duration-200 hover:shadow-md">
            {/* --- CARD HEADER --- */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-xl">
                <div className="flex gap-3">
                    {/* Status Icon */}
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shadow-sm ${isPending ? 'bg-amber-400 animate-pulse' : (isHealthy ? 'bg-emerald-500' : 'bg-red-500')}`}></div>

                    <div>
                        <h3 className="font-bold text-gray-900 text-base leading-none flex items-center gap-2">
                            {title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1.5 font-medium">{desc}</p>

                        {/* Next Run Indicator */}
                        {nextRefreshTime && (
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-wider font-bold text-gray-400">
                                <FaClock size={10} />
                                <span>Next Run: <span className="text-gray-600">{countdownText}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                    {onRefresh && (
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all disabled:opacity-50"
                            title="Run Pipeline Now"
                        >
                            <FaSync size={14} className={isRefreshing ? 'animate-spin text-sky-600' : ''} />
                        </button>
                    )}
                    {onFlush && (
                        <button
                            onClick={() => onFlush(handleFlush)}
                            disabled={isFlushing}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Flush Data Cache"
                        >
                            <FaTrash size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- LOGS SECTION --- */}
            <div className="flex-1 p-0 flex flex-col min-h-[160px]">
                <div className="px-5 py-3 bg-white border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <FaTerminal size={10} /> System Logs
                </div>

                <div className="flex-1 overflow-y-auto max-h-60 custom-scrollbar p-0">
                    {logsToShow.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {logsToShow.map(log => (
                                <LogItem key={log.id} log={log} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-gray-300">
                            <FaHistory size={24} className="mb-2 opacity-20" />
                            <span className="text-xs">No logs recorded</span>
                        </div>
                    )}
                </div>

                {logs.length > 5 && (
                    <button
                        onClick={() => setShowAllLogs(!showAllLogs)}
                        className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        {showAllLogs ? <FaChevronUp /> : <FaChevronDown />}
                        {showAllLogs ? 'Collapse History' : `Show ${logs.length - 5} More`}
                    </button>
                )}
            </div>
        </div>
    );
};

const LogItem = ({ log }) => {
    const isSuccess = log.status === 'SUCCESS';
    const isPending = log.status === 'PENDING';

    const dateObj = parseJavaDate(log.lastFetchTime);

    // Exact Time Format: "Dec 2, 10:30:45 PM"
    const dateStr = dateObj ? dateObj.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }) : 'Unknown Date';

    return (
        <div className="px-5 py-3 hover:bg-gray-50 transition-colors group">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    {isPending ? (
                        <FaSync size={10} className="animate-spin text-amber-500" />
                    ) : (
                        isSuccess ? <FaCheckCircle size={10} className="text-emerald-500" /> : <FaExclamationCircle size={10} className="text-red-500" />
                    )}
                    <span className={`text-xs font-bold ${isPending ? 'text-amber-600' : (isSuccess ? 'text-emerald-700' : 'text-red-700')}`}>
                        {log.status}
                    </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400 whitespace-nowrap">{dateStr}</span>
            </div>

            <div className="pl-5">
                <div className="text-xs text-gray-700 font-medium break-words leading-relaxed">
                    <span className="text-gray-400 font-normal mr-1">[{log.triggerSource}]:</span>
                    {log.details}
                </div>
            </div>
        </div>
    );
};

export default ApiStatusBlock;