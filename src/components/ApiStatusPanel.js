/**
 * AI-CONTEXT:
 * Purpose: Container panel for API and system health status.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`, 
 * changed `rounded-xl` to `rounded`, reduced padding from `p-6` to `p-4`, and removed soft shadows.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { getApiStatusHistory, refreshMovers, refreshIndices, flushMovers, flushIndices } from '../apiConfig';
import ApiStatusBlock from './ApiStatusBlock';
import PasswordPromptModal from './PasswordPromptModal';

const ApiStatusPanel = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '' });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getApiStatusHistory();
            setLogs(response.data);
        } catch (error) {
            console.error("Failed to fetch API status history:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleFlushRequest = (flushHandler, title) => {
        setModalState({
            isOpen: true,
            onConfirm: (password) => flushHandler(password),
            title: title
        });
    };

    const handleModalConfirm = async (password) => {
        if (modalState.onConfirm) {
            setIsActionLoading(true);
            try {
                await modalState.onConfirm(password);
            } catch (error) {
                console.error("Action failed:", error);
                alert(`Action failed: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsActionLoading(false);
                setModalState({ isOpen: false, onConfirm: null, title: '' });
                await fetchLogs();
            }
        }
    };

    // --- CONFIGURATION UPDATED FOR ENTERPRISE PIPELINE ---
    const blockConfigs = [
        {
            title: "Data Pipeline (Python)",
            desc: "Daily script for historical charts & quotes.",
            logFilters: ["Market Data Pipeline (Python)", "Python Data Update"],
            onRefresh: refreshIndices, // Triggers python script
            flushHandler: flushIndices, // Clears cache
            nextRefreshTime: getNextScheduledTime(1, 0, "UTC") // 1 AM UTC
        },
        {
            title: "Market Movers API",
            desc: "Top Gainers, Losers, and Most Active (FMP).",
            logFilters: ["Market Movers -", "Market Data - Top"], // Matches backend
            onRefresh: refreshMovers,
            flushHandler: flushMovers,
            nextRefreshTime: getNextScheduledTime(22, 0, "UTC") // 10 PM UTC
        },
        {
            title: "News Aggregator",
            desc: "External news fetching service.",
            logFilters: ["News Highlights"],
            onRefresh: null,
            flushHandler: null,
            nextRefreshTime: null
        }
    ];

    const filterLogs = (filters) => {
        // Sort by id desc (usually newest first if DB id increments with time) or rely on backend sort
        return logs.filter(log => filters.some(filter => log.apiName.includes(filter)));
    };

    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-[15px] font-bold text-slate-800">System Status & Data Feeds</h2>
                    <p className="text-[11px] text-slate-500">Monitor data pipelines and API health.</p>
                </div>
                <button onClick={fetchLogs} className="px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 rounded hover:bg-slate-200 transition-colors border border-slate-200">
                    Refresh Logs
                </button>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-[11px] uppercase tracking-wider font-bold animate-pulse">Loading status logs...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {blockConfigs.map((config) => (
                        <ApiStatusBlock
                            key={config.title}
                            title={config.title}
                            desc={config.desc}
                            logs={filterLogs(config.logFilters)}
                            onRefresh={config.onRefresh}
                            onFlush={(handler) => handleFlushRequest((password) => handler(password, config.flushHandler), `Flush ${config.title}`)}
                            nextRefreshTime={config.nextRefreshTime}
                        />
                    ))}
                </div>
            )}

            <PasswordPromptModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onConfirm={handleModalConfirm}
                title={modalState.title}
                isLoading={isActionLoading}
            />
        </div>
    );
};

function getNextScheduledTime(hour, minute, timeZone) {
    const now = new Date();
    let nextRefresh = new Date();
    nextRefresh.setUTCHours(hour, minute, 0, 0);
    if (now.getTime() > nextRefresh.getTime()) {
        nextRefresh.setUTCDate(nextRefresh.getUTCDate() + 1);
    }
    return nextRefresh;
}

export default ApiStatusPanel;