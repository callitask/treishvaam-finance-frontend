import React, { useEffect, useState } from 'react';
import { getNewsHighlights } from '../apiConfig';
import NewsCard from './news/NewsCard';
import { Loader2 } from 'lucide-react';

const NewsHighlights = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await getNewsHighlights();
                // Phase 18: Backend now returns a Page object, access .content
                const articles = response.data.content || response.data || [];
                setNews(articles.slice(0, 6)); // Show top 6
            } catch (error) {
                console.error("Failed to load news highlights", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            </div>
        );
    }

    if (news.length === 0) return null;

    return (
        <section className="py-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Global Market Intelligence</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Curated insights from Tier-1 financial sources.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((article) => (
                        <NewsCard key={article.id || article.link} article={article} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewsHighlights;