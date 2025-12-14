import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchPosts } from '../apiConfig';

const SearchAutocomplete = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 1) {
                try {
                    const { data } = await searchPosts(query);
                    setResults(data);
                    setShowResults(true);
                } catch (error) {
                    console.error("Search failed", error);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (post) => {
        setQuery('');
        setShowResults(false);
        navigate(`/category/${post.category?.slug || 'general'}/${post.userFriendlySlug}/${post.urlArticleId}`);
    };

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            setShowResults(false);
            // Implement full search page navigation if needed
        }
    }

    return (
        <div ref={wrapperRef} className="relative w-full max-w-md hidden md:block">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    id="global-search-input"
                    name="q"
                    className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-sky-500 sm:text-sm transition-colors"
                    placeholder="Search markets, news, analysis..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleEnter}
                    autoComplete="off"
                />
            </div>

            {showResults && results.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {results.map((post) => (
                        <li
                            key={post.id}
                            onClick={() => handleSelect(post)}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium truncate">{post.title}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {post.category?.name} • {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchAutocomplete;