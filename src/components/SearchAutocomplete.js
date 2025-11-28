import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPosts } from '../apiConfig';
import { FaSearch } from 'react-icons/fa';

const SearchAutocomplete = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Internal state manages the input, separate from the URL
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState([]);

    // Fetch suggestions purely based on what is typed, NO URL side effects
    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await searchPosts(searchQuery);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            setSuggestions([]);
        }
    }, []);

    // Debounce the API call, not the URL update
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);

        return () => clearTimeout(handler);
    }, [query, fetchSuggestions]);

    const handleSelect = (post) => {
        setQuery('');
        setSuggestions([]);

        // Construct the correct long-form URL using new API fields
        // Fallback to 'uncategorized' if category is missing
        const category = post.categorySlug || 'uncategorized';
        const friendlySlug = post.userFriendlySlug || 'post';
        const articleId = post.urlArticleId || post.id;

        navigate(`/category/${category}/${friendlySlug}/${articleId}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setSuggestions([]);
            // Only update the main page listing when Enter is pressed
            navigate(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search articles..."
                    className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((post) => (
                        <li
                            key={post.id}
                            onClick={() => handleSelect(post)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 truncate"
                        >
                            {post.title}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchAutocomplete;