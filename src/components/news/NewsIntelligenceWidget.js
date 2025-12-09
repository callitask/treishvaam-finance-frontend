import React, { useState, useEffect } from 'react';
import { getNewsHighlights, getArchivedNews } from '../../apiConfig';
import NewsCard from './NewsCard';
import { Globe, Zap, RefreshCw } from 'lucide-react';

const NewsIntelligenceWidget = () => {
    const [activeTab, setActiveTab] = useState('highlights'); // 'highlights' or 'wire'
    const [highlights, setHighlights] = useState([]);
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        fetchAllData();
        // Auto-refresh every 60 seconds
        const interval = setInterval(() => fetchAllData(true), 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const [highRes, archRes] = await Promise.all([
                getNewsHighlights(),
                getArchivedNews()
            ]);

            // Sort by date descending
            const sortFn = (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt);

            setHighlights((highRes.data || []).sort(sortFn));
            setArchive((archRes.data || []).sort(sortFn));
        } catch (err) {
            console.error("News Widget Fetch Error:", err);
        } finally {
            if (!silent) setLoading(false);
            else setIsRefreshing(false);
        }
    };

    const activeData = activeTab === 'highlights' ? highlights : archive;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px] overflow-hidden">

            {/* HEADER & TABS */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('highlights')}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
                            ${activeTab === 'highlights'
                                ? 'bg-white text-sky-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <Zap size={14} className={activeTab === 'highlights' ? 'fill-sky-700' : ''} />
                        Top Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('wire')}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all
                            ${activeTab === 'wire'
                                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <Globe size={14} />
                        Global Wire
                    </button>
                </div>

                {/* Refresh Icon */}
                <div className="text-gray-300" title="Auto-updating">
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-sky-500' : ''} />
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative">

                {/* Loading Spinner */}
                {loading && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fetching Intel...</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && activeData.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                        <Globe size={32} className="mb-2 opacity-20" />
                        <p className="text-xs font-medium">No market news available.</p>
                    </div>
                )}

                {/* News List */}
                {!loading && activeData.map((article, index) => {
                    // Logic: First item in "Highlights" gets special treatment
                    const isFeatured = activeTab === 'highlights' && index === 0;

                    return (
                        <div key={article.id || index} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 50}ms` }}>
                            <NewsCard
                                article={article}
                                variant={isFeatured ? 'featured' : 'compact'}
                            />
                            {isFeatured && <div className="h-px bg-gray-100 my-3 mx-2"></div>}
                        </div>
                    );
                })}

                {!loading && activeData.length > 0 && (
                    <div className="text-center py-4">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;