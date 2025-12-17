import React from 'react';
import { BASE_URL } from '../../apiConfig'; // Now this named import will work!

const NewsCard = ({ article }) => {
    // Helper to resolve the correct image URL
    const getImageUrl = (url) => {
        if (!url) return '/placeholder-news.jpg';

        // If it's a relative path (e.g. /api/uploads/...), prepend backend URL
        if (url.startsWith('/')) {
            return `${BASE_URL}${url}`;
        }

        // If it's absolute (e.g. https://...), return as is
        return url;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full">

            {/* Image Section */}
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="block relative h-48 overflow-hidden group">
                <img
                    src={getImageUrl(article.imageUrl)}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = '/placeholder-news.jpg'; }}
                />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 m-2 rounded shadow-sm">
                    {article.source || 'News'}
                </div>
            </a>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2 space-x-2">
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <a href={article.link} target="_blank" rel="noopener noreferrer" className="block mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-tight hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                    </h3>
                </a>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
                    {article.description}
                </p>

                <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mt-auto"
                >
                    Read full story
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        </div>
    );
};

export default NewsCard;