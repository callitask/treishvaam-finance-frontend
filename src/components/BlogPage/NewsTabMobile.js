import React, { useState, useEffect } from 'react';
import { getNewsHighlights, getArchivedNews } from '../../apiConfig';
import NewsCard from '../news/NewsCard';
// Ensure CSS is active globally, but explicit import helps some bundlers
import '../news/NewsCard.css';

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

    // --- SMART LOGIC (Mobile Version) ---
    const determineVariant = (article, index, type) => {
        if (type === 'archive') return 'standard'; // Archive is always simple list

        // Rule 1: Mobile Hero
        if (index === 0) return 'impact';

        // Rule 2: Visual Break (Item #4)
        if (index === 3 && article.imageUrl) return 'market-snap';

        // Rule 3: Ranked List at bottom
        if (index >= 6) return 'ranked';

        // Rule 4: Opinion
        const title = article.title || "";
        if (["Why", "Opinion", "Outlook"].some(k => title.includes(k))) return 'opinion';

        return 'standard';
    };

    const renderSkeleton = () => (
        <div className="p-4 space-y-4">
            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '90%' }}></div>
            <div className="skeleton" style={{ height: '80px', marginTop: '20px' }}></div>
            <div className="skeleton" style={{ height: '80px' }}></div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pb-24">
            {/* Header / Filter Switcher */}
            <div className="sticky top-14 z-20 bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="flex px-4 py-3 gap-3">
                    <button
                        onClick={() => setActiveSection('highlights')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-none border-b-2 transition-all ${activeSection === 'highlights'
                            ? 'border-sky-700 text-sky-700'
                            : 'border-transparent text-gray-400'
                            }`}
                    >
                        Top Stories
                    </button>
                    <button
                        onClick={() => setActiveSection('archive')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-none border-b-2 transition-all ${activeSection === 'archive'
                            ? 'border-sky-700 text-sky-700'
                            : 'border-transparent text-gray-400'
                            }`}
                    >
                        The Wire
                    </button>
                </div>
            </div>

            {/* Content Feed */}
            <div>
                {loading ? renderSkeleton() : (
                    <div className="flex flex-col">
                        {activeSection === 'highlights' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                {highlights.length > 0 ? (
                                    <div className="px-4 pt-4">
                                        {highlights.map((article, index) => {
                                            const variant = determineVariant(article, index, 'highlights');
                                            return (
                                                <NewsCard
                                                    key={article.id || index}
                                                    article={article}
                                                    variant={variant}
                                                    rank={index - 5} // Adjust rank offset
                                                />
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest">No highlights available</div>
                                )}
                            </div>
                        )}

                        {activeSection === 'archive' && (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                                {archive.length > 0 ? (
                                    <div className="px-4 pt-4">
                                        {archive.map((article, index) => (
                                            <NewsCard
                                                key={article.id || index}
                                                article={article}
                                                variant="standard"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-400 text-xs uppercase tracking-widest">No archived news</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsTabMobile;