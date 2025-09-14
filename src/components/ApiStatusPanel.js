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
    

    const blockConfigs = [
        {
            title: "US Market Indices (Charts)",
            logFilters: ["Market Chart"],
            onRefresh: refreshIndices,
            flushHandler: flushIndices,
            nextRefreshTime: null
        },
        {
            title: "Top Gainers (US)",
            logFilters: ["Market Data - Top Gainers (US)"],
            onRefresh: refreshMovers,
            flushHandler: flushMovers,
            nextRefreshTime: getNextScheduledTime(22, 0, "UTC")
        },
        {
            title: "Top Losers (US)",
            logFilters: ["Market Data - Top Losers (US)"],
            onRefresh: refreshMovers,
            flushHandler: flushMovers,
            nextRefreshTime: getNextScheduledTime(22, 0, "UTC")
        },
        {
            title: "Most Active (US)",
            logFilters: ["Market Data - Most Active (US)"],
            onRefresh: refreshMovers,
            flushHandler: flushMovers,
            nextRefreshTime: getNextScheduledTime(22, 0, "UTC")
        }
    ];

    const filterLogs = (filters) => {
        return logs.filter(log => filters.some(filter => log.apiName.includes(filter)));
    };

    return (
        <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
             <h2 className="text-2xl font-bold mb-6 text-gray-800">API Status & Control Center</h2>
            {isLoading ? <p>Loading logs...</p> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {blockConfigs.map((config) => (
                        <ApiStatusBlock
                            key={config.title}
                            title={config.title}
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
    
    // This doesn't account for MON-FRI, but is fine for a countdown.
    return nextRefresh;
}


export default ApiStatusPanel;