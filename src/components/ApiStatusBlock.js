/**
 * AI-CONTEXT:
 * Purpose: Individual health block rendering container pipeline status and logs.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`, 
 * changed `rounded-xl` to `rounded`, removed `hover:shadow-md`, tightened padding to `p-3`, 
 * and set typography to `text-[11px]` and `text-[10px]` tracking strings.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
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
        <div className="bg-white rounded border border-slate-200 shadow-sm flex flex-col h-full transition-all duration-200">
            {/* --- CARD HEADER --- */}
            <div className="p-3 border-b border-slate-200 flex justify-between items-start bg-slate-50/80 rounded-t">
                <div className="flex gap-2.5">
                    {/* Status Icon */}
                    <div className={`mt-1 w-2 h-2 rounded-full shadow-sm ${isPending ? 'bg-amber-400 animate-pulse' : (isHealthy ? 'bg-emerald-500' : 'bg-red-500')}`}></div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-[13px] leading-none flex items-center gap-2">
                            {title}
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium">{desc}</p>
                        {/* Next Run Indicator */}
                        {nextRefreshTime && (
                            <div className="flex items-center gap-1.5 mt-2 text-[9px] uppercase tracking-wider font-bold text-slate-400">
                                <FaClock size={9} />
                                <span>Next Run: <span className="text-slate-600">{countdownText}</span></span>
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
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-all disabled:opacity-50"
                            title="Run Pipeline Now"
                        >
                            <FaSync size={12} className={isRefreshing ? 'animate-spin text-slate-800' : ''} />
                        </button>
                    )}
                    {onFlush && (
                        <button
                            onClick={() => onFlush(handleFlush)}
                            disabled={isFlushing}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                            title="Flush Data Cache"
                        >
                            <FaTrash size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- LOGS SECTION --- */}
            <div className="flex-1 p-0 flex flex-col min-h-[140px]">
                <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <FaTerminal size={9} /> System Logs
                </div>
                <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar p-0">
                    {logsToShow.length > 0 ? (
                        <div className="divide-y divide-slate-50">
                            {logsToShow.map(log => (
                                <LogItem key={log.id} log={log} />
                            ))}
                        </div>
                    ) : (
                        <div className="h-24 flex flex-col items-center justify-center text-slate-300">
                            <FaHistory size={16} className="mb-1.5 opacity-20" />
                            <span className="text-[10px]">No logs recorded</span>
                        </div>
                    )}
                </div>

                {logs.length > 5 && (
                    <button
                        onClick={() => setShowAllLogs(!showAllLogs)}
                        className="w-full py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-t border-slate-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                        {showAllLogs ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
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
        <div className="px-3 py-2 hover:bg-slate-50 transition-colors group">
            <div className="flex justify-between items-start mb-0.5">
                <div className="flex items-center gap-1.5">
                    {isPending ? (
                        <FaSync size={9} className="animate-spin text-amber-500" />
                    ) : (
                        isSuccess ? <FaCheckCircle size={9} className="text-emerald-500" /> : <FaExclamationCircle size={9} className="text-red-500" />
                    )}
                    <span className={`text-[10px] font-bold ${isPending ? 'text-amber-600' : (isSuccess ? 'text-emerald-700' : 'text-red-700')}`}>
                        {log.status}
                    </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">{dateStr}</span>
            </div>
            <div className="pl-4">
                <div className="text-[10px] text-slate-600 font-medium break-words leading-relaxed">
                    <span className="text-slate-400 font-normal mr-1">[{log.triggerSource}]:</span>
                    {log.details}
                </div>
            </div>
        </div>
    );
};

export default ApiStatusBlock;