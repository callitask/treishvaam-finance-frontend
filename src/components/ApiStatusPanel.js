import React, { useState, useEffect, useCallback } from 'react';
import { getApiStatuses, getApiStatusHistory, refreshMarketData, refreshNewsData } from '../apiConfig';
import { FaSync, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ApiStatusPanel = ({ showHistory = false }) => {
    const [statuses, setStatuses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState({});

    const fetchStatuses = useCallback(async () => {
        setIsLoading(true);
        try {
            // --- MODIFIED: Fetch history or latest based on prop ---
            const response = showHistory ? await getApiStatusHistory() : await getApiStatuses();
            setStatuses(response.data);
        } catch (error) {
            console.error("Failed to fetch API statuses:", error);
        } finally {
            setIsLoading(false);
        }
    }, [showHistory]);

    useEffect(() => {
        fetchStatuses();
        const interval = setInterval(fetchStatuses, 30000);
        return () => clearInterval(interval);
    }, [fetchStatuses]);

    const handleRefresh = async (apiName) => {
        setRefreshing(prev => ({ ...prev, [apiName]: true }));
        try {
            if (apiName.includes("Market Data")) {
                await refreshMarketData();
            } else if (apiName.includes("News")) {
                await refreshNewsData();
            }
            await fetchStatuses();
        } catch (error) {
            console.error(`Failed to refresh ${apiName}:`, error);
        } finally {
            setRefreshing(prev => ({ ...prev, [apiName]: false }));
        }
    };

    const formatStatusTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });
    };

    const getProfessionalButtonName = (apiName) => {
        if (apiName.includes("Market Data")) return "Sync Market Data";
        if (apiName.includes("News")) return "Sync News Feed";
        return "Refresh Now";
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                {showHistory ? "API Status & Control Center" : "API Status"}
            </h2>
            {isLoading ? <p>Loading statuses...</p> : (
                <div className="space-y-4">
                    {statuses.length > 0 ? statuses.map(status => (
                        <div key={status.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="mb-3 sm:mb-0">
                                <p className="font-semibold text-gray-800">{status.apiName}</p>
                                <p className="text-xs text-gray-500">
                                    Last Synced: {formatStatusTime(status.lastFetchTime)} ({status.triggerSource})
                                </p>
                                <div className={`flex items-center text-sm mt-1 ${status.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                                    {status.status === 'SUCCESS' ? <FaCheckCircle className="mr-2" /> : <FaExclamationCircle className="mr-2" />}
                                    <span>{status.status}</span>
                                </div>
                                {status.status === 'FAILURE' && (
                                    <p className="text-xs text-red-500 mt-1 break-all" title={status.details}>
                                        Details: {status.details}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleRefresh(status.apiName)}
                                disabled={refreshing[status.apiName]}
                                className="bg-sky-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition flex items-center disabled:opacity-50 disabled:cursor-wait w-full sm:w-auto"
                            >
                                <FaSync className={`mr-2 ${refreshing[status.apiName] ? 'animate-spin' : ''}`} />
                                {getProfessionalButtonName(status.apiName)}
                            </button>
                        </div>
                    )) : <p className="text-center text-gray-500 py-4">No API status logs found.</p>}
                </div>
            )}
        </div>
    );
};

export default ApiStatusPanel;