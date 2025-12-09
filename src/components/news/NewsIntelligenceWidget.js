import React, { useState, useEffect } from 'react';
import { getNewsHighlights, getArchivedNews } from '../../apiConfig';
import NewsCard from './NewsCard';
import { RefreshCw, Layers, Zap } from 'lucide-react';

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

    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (loading && activeData.length === 0) {
            return (
                <div className="py-20 text-center space-y-3">
                    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Loading Intel...</span>
                </div>
            );
        }

        if (activeData.length === 0) {
            return (
                <div className="py-20 text-center text-gray-400 px-6">
                    <p className="text-xs font-medium">No market data available.</p>
                </div>
            );
        }

        // --- 4-TIER VISUAL DISTRIBUTION ---
        return activeData.map((article, index) => {
            let variant = 'ticker'; // Default

            if (activeTab === 'highlights') {
                if (index === 0) variant = 'hero';          // #1
                else if (index <= 2) variant = 'focus';     // #2, #3
                else if (index <= 5) variant = 'standard';  // #4, #5, #6
                // Index 6+ is ticker
            } else {
                // "Global Wire" Tab is purely chronological ticker
                variant = 'ticker';
            }

            return (
                <div key={article.id || index} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 30}ms` }}>
                    <NewsCard article={article} variant={variant} />

                    {/* Visual Separators */}
                    {variant === 'standard' && index !== 5 && <div className="h-px bg-gray-100 my-4"></div>}
                    {variant === 'focus' && <div className="h-px bg-gray-100 my-6 mx-8"></div>}
                </div>
            );
        });
    };

    return (
        <div className="flex flex-col w-full h-full">

            {/* 1. Minimal Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('highlights')}
                        className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5
                            ${activeTab === 'highlights' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}
                        `}
                    >
                        <Zap size={12} className={activeTab === 'highlights' ? 'text-amber-500 fill-amber-500' : ''} />
                        Top Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('wire')}
                        className={`text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5
                            ${activeTab === 'wire' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'}
                        `}
                    >
                        <Layers size={12} className={activeTab === 'wire' ? 'text-sky-500' : ''} />
                        The Wire
                    </button>
                </div>
                <RefreshCw size={10} className={`text-gray-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            </div>

            {/* 2. Content Stream (Natural Flow, No Internal Scroll) */}
            <div className="flex-1">
                {renderContent()}

                {/* End Marker */}
                {!loading && activeData.length > 0 && (
                    <div className="flex justify-center py-8">
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-0.5"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-0.5"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full mx-0.5"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsIntelligenceWidget;