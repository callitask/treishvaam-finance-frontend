import React, { useState, useEffect } from 'react';
import { getNewsHighlights } from '../apiConfig';

// Helper function to format the date and time
const formatNewsTimestamp = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

export const NewsListItem = ({ title, link, source, publishedAt }) => {
    return (
        <div className="py-2 border-b border-gray-200 last:border-b-0">
            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:text-sky-600 transition-colors duration-200 leading-snug font-medium"
            >
                {title}
            </a>
            <div className="text-xs text-gray-500 mt-1">
                <span className="font-semibold capitalize">{source ? source.replace(/_/g, ' ') : 'News'}</span>
                <span className="mx-1.5">|</span>
                <span>{formatNewsTimestamp(publishedAt)}</span>
            </div>
        </div>
    );
};

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

    if (loading || error || highlights.length === 0) {
        return null;
    }

    return (
        <div className="mb-6">
            <h3 className="text-base font-bold text-gray-800 pb-2 mb-2 border-b-2 border-gray-300">
                Recent Highlights
            </h3>
            <div>
                {highlights.map((item) => (
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

export default NewsHighlights;