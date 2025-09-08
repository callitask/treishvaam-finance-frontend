import React, { useState, useEffect } from 'react';
import { getNewsHighlights } from '../apiConfig';

const NewsHighlights = () => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await getNewsHighlights();
                if (response && Array.isArray(response.data)) {
                    setHighlights(response.data);
                } else {
                    setHighlights([]);
                }
                setError(null);
            } catch (err) {
                setError('Failed to load news highlights.');
                console.error('Error fetching news highlights:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const NewsListItem = ({ title, link }) => {
        return (
            <div className="py-2 border-b border-gray-200 last:border-b-0">
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 hover:text-sky-600 transition-colors duration-200 leading-snug"
                >
                    {title}
                </a>
            </div>
        );
    };

    if (loading || error || highlights.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 pb-2 mb-2 border-b-2 border-gray-300">
                More News
            </h3>
            <div>
                {highlights.slice(0, 7).map((item) => (
                    <NewsListItem
                        key={item.id}
                        title={item.title}
                        link={item.link}
                    />
                ))}
            </div>
        </div>
    );
};

export default NewsHighlights;