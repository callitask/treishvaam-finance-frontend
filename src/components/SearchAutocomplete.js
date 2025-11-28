import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPosts } from '../apiConfig';
import { FaSearch, FaNewspaper, FaChartLine, FaClock, FaTimes } from 'react-icons/fa';

// Helper to parse your custom ID: "fri281120251153234" -> "Nov 28, 2025"
const parseDateFromId = (id) => {
    if (!id || id.length < 15) return '';
    try {
        const day = id.substring(3, 5);
        const month = id.substring(5, 7);
        const year = id.substring(7, 11);
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return ''; }
};

// Highlight matching text
const HighlightedText = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === highlight.toLowerCase() ?
                    <span key={i} className="text-sky-700 font-extrabold bg-sky-50">{part}</span> : part
            )}
        </span>
    );
};

const SearchAutocomplete = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef(null);

    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await searchPosts(searchQuery);
            setSuggestions(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => fetchSuggestions(query), 200); // Fast 200ms debounce
        return () => clearTimeout(handler);
    }, [query, fetchSuggestions]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (post) => {
        const category = post.categorySlug || 'news';
        const friendlySlug = post.userFriendlySlug || post.slug;
        const articleId = post.urlArticleId || post.id;
        setQuery(''); // Clear search on select for clean nav
        setSuggestions([]);
        setIsFocused(false);
        navigate(`/category/${category}/${friendlySlug}/${articleId}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                handleSelect(suggestions[selectedIndex]);
            } else {
                setIsFocused(false);
                navigate(`/?q=${encodeURIComponent(query)}`);
            }
        } else if (e.key === 'Escape') {
            setIsFocused(false);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
            <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'shadow-lg ring-2 ring-sky-500' : 'shadow-sm border-gray-200'} bg-white rounded-lg border`}>
                <FaSearch className="ml-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); setIsFocused(true); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search markets, news, or analysis..."
                    className="w-full py-3 px-4 text-gray-700 placeholder-gray-400 outline-none rounded-lg"
                    autoComplete="off"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setSuggestions([]); }} className="mr-4 text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                )}
            </div>

            {/* Enterprise Dropdown Results */}
            {isFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Top Results
                    </div>
                    <ul className="max-h-[70vh] overflow-y-auto">
                        {suggestions.map((post, index) => (
                            <li
                                key={post.id}
                                onClick={() => handleSelect(post)}
                                className={`px-4 py-3 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-none flex items-start gap-3
                                    ${index === selectedIndex ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                            >
                                {/* Icon based on category */}
                                <div className={`mt-1 p-2 rounded-lg ${post.categorySlug === 'market' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {post.categorySlug === 'market' ? <FaChartLine size={14} /> : <FaNewspaper size={14} />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                                        <HighlightedText text={post.title} highlight={query} />
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span className="uppercase font-bold text-xs tracking-wide text-sky-600">
                                            {post.categorySlug || 'News'}
                                        </span>
                                        {post.urlArticleId && (
                                            <span className="flex items-center gap-1">
                                                <FaClock size={10} />
                                                {parseDateFromId(post.urlArticleId)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="bg-gray-50 px-4 py-2 text-xs text-center text-gray-400 border-t border-gray-100">
                        Press <span className="font-mono font-bold">Enter</span> to search all
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;