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
                await fetchLogs(); // Refresh logs after action
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
            flushHandler: flushIndices, // Clears cache if needed
            nextRefreshTime: getNextScheduledTime(1, 0, "UTC") // 1 AM UTC
        },
        {
            title: "Market Movers API",
            desc: "Top Gainers, Losers, and Most Active (FMP).",
            logFilters: ["Market Movers -", "Market Data - Top"], // Catches new and old logs
            onRefresh: refreshMovers,
            flushHandler: flushMovers,
            nextRefreshTime: getNextScheduledTime(22, 0, "UTC") // 10 PM UTC
        },
        {
            title: "News Aggregator",
            desc: "External news fetching service.",
            logFilters: ["News Highlights"],
            // Assuming refreshNews exists in imports if needed, else null
            onRefresh: null,
            flushHandler: null,
            nextRefreshTime: null
        }
    ];

    const filterLogs = (filters) => {
        return logs.filter(log => filters.some(filter => log.apiName.includes(filter)));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">System Status</h2>
                    <p className="text-sm text-gray-500">Monitor data pipelines and API health.</p>
                </div>
                <button onClick={fetchLogs} className="text-sm text-blue-600 hover:underline">
                    Refresh Logs
                </button>
            </div>

            {isLoading ? <p className="text-sm text-gray-500">Loading status logs...</p> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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