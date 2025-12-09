import React, { useState, useEffect } from 'react';
import { getNewsHighlights, getArchivedNews } from '../../apiConfig';
import NewsCard from './NewsCard';
import { Globe, Zap, RefreshCw, Layers } from 'lucide-react';

const NewsIntelligenceWidget = () => {
    const [activeTab, setActiveTab] = useState('highlights'); // 'highlights' | 'wire'
    const [highlights, setHighlights] = useState([]);
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 60000); // 60s Auto-refresh
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

            // Sort: Newest First
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

    // --- RENDER HELPERS ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading Intel...</span>
                </div>
            );
        }

        if (activeData.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                    <Globe size={32} className="mb-2 opacity-20" />
                    <p className="text-xs font-medium">No market data available.</p>
                </div>
            );
        }

        // --- EDITORIAL LOGIC ---
        return activeData.map((article, index) => {
            let variant = 'brief'; // Default to compact list

            if (activeTab === 'highlights') {
                if (index === 0) variant = 'hero';       // #1 Story = Large Card
                else if (index < 5) variant = 'standard'; // #2-#5 = Thumbnail Rows
                // Index 5+ = Briefs (Text only)
            } else {
                // For "Global Wire" tab, everything is standard or brief
                variant = index < 3 ? 'standard' : 'brief';
            }

            return (
                <div key={article.id || index} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 30}ms` }}>
                    <NewsCard article={article} variant={variant} />
                </div>
            );
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[700px] overflow-hidden">

            {/* 1. Header & Tabs */}
            <div className="flex flex-col bg-gray-50/50 border-b border-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Market Intelligence</h3>
                    </div>
                    <RefreshCw size={12} className={`text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                </div>

                <div className="px-4 pb-2 flex gap-2">
                    <button
                        onClick={() => setActiveTab('highlights')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border
                            ${activeTab === 'highlights'
                                ? 'bg-white border-gray-200 text-slate-900 shadow-sm'
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                        `}
                    >
                        <Zap size={14} className={activeTab === 'highlights' ? 'fill-amber-400 text-amber-500' : ''} />
                        Top Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('wire')}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border
                            ${activeTab === 'wire'
                                ? 'bg-white border-gray-200 text-slate-900 shadow-sm'
                                : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}
                        `}
                    >
                        <Layers size={14} className={activeTab === 'wire' ? 'text-sky-500' : ''} />
                        The Wire
                    </button>
                </div>
            </div>

            {/* 2. Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative space-y-1">
                {renderContent()}

                {/* End Marker */}
                {!loading && activeData.length > 0 && (
                    <div className="flex justify-center py-6">
                        <div className="h-1 w-1 bg-gray-300 rounded-full mx-1"></div>
                        <div className="h-1 w-1 bg-gray-300 rounded-full mx-1"></div>
                        <div className="h-1 w-1 bg-gray-300 rounded-full mx-1"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;