import React, { useState, useEffect } from 'react';
import { getArchivedNews } from '../apiConfig';
import { NewsListItem } from './NewsHighlights'; // Re-using the list item component

const DeeperDive = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await getArchivedNews();
                if (response && Array.isArray(response.data)) {
                    setArticles(response.data);
                } else {
                    setArticles([]);
                }
                setError(null);
            } catch (err) {
                setError('Failed to load archived news.');
                console.error('Error fetching archived news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading || error || articles.length === 0) {
        return null;
    }

    return (
        <div className="mt-6">
            <h3 className="text-base font-bold text-gray-800 pb-2 mb-2 border-b-2 border-gray-300">
                Deeper Dive
            </h3>
            <div>
                {articles.map((item) => (
                    <NewsListItem
                        key={item.id}
                        title={item.title}
                        link={item.link}
                        source={item.source}
                        publishedAt={item.publishedAt}
                    />
                ))}
            </div>
        </div>
    );
};

export default DeeperDive;