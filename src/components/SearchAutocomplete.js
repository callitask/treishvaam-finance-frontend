import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPosts } from '../apiConfig';
import { FaSearch } from 'react-icons/fa';

const SearchAutocomplete = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // The query is now driven by the URL search parameter 'q'
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState([]);
    // Removed the unused setIsLoading state

    // Effect to update the URL when the user stops typing
    useEffect(() => {
        const handler = setTimeout(() => {
            if (query) {
                setSearchParams({ q: query }, { replace: true });
            } else {
                setSearchParams({}, { replace: true });
            }
        }, 300); // Debounce URL updates

        return () => {
            clearTimeout(handler);
        };
    }, [query, setSearchParams]);
    
    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        // setIsLoading(true); // This line can be removed
        try {
            const response = await searchPosts(searchQuery);
            setSuggestions(response.data);
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
            setSuggestions([]);
        } finally {
            // setIsLoading(false); // This line can be removed
        }
    }, []);

    useEffect(() => {
        fetchSuggestions(query);
    }, [query, fetchSuggestions]);

    const handleSelect = (slug) => {
        setQuery('');
        setSuggestions([]);
        navigate(`/blog/${slug}`);
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
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
                            onClick={() => handleSelect(post.slug)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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