import React, { useState, useEffect } from 'react';
// FIX: Using ../../ to reach src/apiConfig.js
import { getNewsHighlights, getArchivedNews } from '../../apiConfig';
import { FaClock, FaExternalLinkAlt, FaGlobeAmericas, FaBolt } from 'react-icons/fa';

// Helper for formatting relative time
const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Skeleton Loader
const NewsSkeleton = () => (
    <div className="p-4 border-b border-gray-100 animate-pulse">
        <div className="h-3 bg-gray-200 w-24 rounded mb-2"></div>
        <div className="h-5 bg-gray-200 w-full rounded mb-2"></div>
        <div className="h-5 bg-gray-200 w-3/4 rounded"></div>
    </div>
);

const NewsItem = ({ item, isHighlight }) => (
    <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`block p-4 border-b border-gray-100 active:bg-gray-50 transition-colors ${isHighlight ? 'bg-sky-50/50' : ''}`}
    >
        <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-2">
                {isHighlight && <FaBolt className="text-amber-500 text-xs" />}
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                    {item.source ? item.source.replace(/_/g, ' ') : 'Market Wire'}
                </span>
            </div>
            <div className="flex items-center text-[10px] text-gray-400">
                <FaClock className="mr-1" size={10} />
                {timeAgo(item.publishedAt)}
            </div>
        </div>

        <h3 className={`font-serif leading-snug text-gray-900 ${isHighlight ? 'text-base font-bold' : 'text-sm font-semibold'}`}>
            {item.title}
        </h3>

        <div className="mt-2 flex items-center justify-end">
            <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 group">
                Read Source <FaExternalLinkAlt size={8} />
            </span>
        </div>
    </a>
);

const NewsTabMobile = () => {
    const [activeSection, setActiveSection] = useState('highlights');
    const [highlights, setHighlights] = useState([]);
    const [archive, setArchive] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllNews = async () => {
            setLoading(true);
            try {
                const [highRes, archRes] = await Promise.all([
                    getNewsHighlights(),
                    getArchivedNews()
                ]);
                setHighlights(highRes.data || []);
                setArchive(archRes.data || []);
            } catch (err) {
                console.error("News fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllNews();
    }, []);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header / Filter Switcher */}
            <div className="sticky top-14 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="flex px-2 py-2">
                    <button
                        onClick={() => setActiveSection('highlights')}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeSection === 'highlights' ? 'bg-sky-100 text-sky-700' : 'text-gray-500'}`}
                    >
                        Top Stories
                    </button>
                    <button
                        onClick={() => setActiveSection('archive')}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeSection === 'archive' ? 'bg-sky-100 text-sky-700' : 'text-gray-500'}`}
                    >
                        The Wire
                    </button>
                </div>
            </div>

            {/* Content Feed */}
            <div>
                {loading ? (
                    [...Array(6)].map((_, i) => <NewsSkeleton key={i} />)
                ) : (
                    <>
                        {activeSection === 'highlights' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                    <FaBolt className="text-amber-500" />
                                    <h2 className="text-xs font-bold text-gray-500 uppercase">Breaking & Trending</h2>
                                </div>
                                {highlights.map(item => <NewsItem key={item.id} item={item} isHighlight={true} />)}
                                {highlights.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No highlights available.</div>}
                            </div>
                        )}

                        {activeSection === 'archive' && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                    <FaGlobeAmericas className="text-blue-500" />
                                    <h2 className="text-xs font-bold text-gray-500 uppercase">Global Feed</h2>
                                </div>
                                {archive.map(item => <NewsItem key={item.id} item={item} />)}
                                {archive.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No archived news available.</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsTabMobile;