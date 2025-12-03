import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllPostsForAdmin, getDrafts, deletePost, duplicatePost, bulkDeletePosts, getCategories } from '../apiConfig';

export const useManagePosts = () => {
    const [rawData, setRawData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- VIEW STATE ---
    const [view, setView] = useState('ALL'); // 'ALL', 'PUBLISHED', 'DRAFT', 'SCHEDULED'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    // --- DATA FETCHING ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch everything in parallel for speed
            const [postsRes, draftsRes, catsRes] = await Promise.all([
                getAllPostsForAdmin(),
                getDrafts(),
                getCategories()
            ]);

            // Normalize and merge data
            const published = (postsRes.data || []).map(p => ({ ...p, _type: 'post' }));
            const drafts = (draftsRes.data || []).map(d => ({ ...d, _type: 'draft', status: 'DRAFT' })); // Ensure status exists

            // Combine all into one master list
            // Note: Scheduled posts usually come from the 'posts' endpoint but have status='SCHEDULED'
            setRawData([...published, ...drafts]);
            setCategories(catsRes.data || []);
            setError(null);
        } catch (err) {
            console.error("Data fetch error:", err);
            setError("Failed to load content data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- FILTERING & SORTING ENGINE ---
    const processedData = useMemo(() => {
        let data = [...rawData];

        // 1. Filter by View Tab
        if (view !== 'ALL') {
            data = data.filter(item => item.status === view);
        }

        // 2. Filter by Category
        if (selectedCategory !== 'All') {
            data = data.filter(item => item.category?.name === selectedCategory);
        }

        // 3. Search (Title & Author)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.author && item.author.toLowerCase().includes(lowerQuery))
            );
        }

        // 4. Sorting
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [rawData, view, selectedCategory, searchQuery, sortConfig]);

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedData.slice(start, start + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    // --- ACTIONS ---
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(paginatedData.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await deletePost(id);
            // Optimistic update
            setRawData(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Failed to delete post.");
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
        try {
            await bulkDeletePosts(selectedIds);
            setRawData(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (err) {
            alert("Bulk delete failed.");
        }
    };

    const handleDuplicate = async (id) => {
        try {
            await duplicatePost(id);
            fetchData(); // Refresh to see the new draft
            alert("Post duplicated as draft.");
        } catch (err) {
            alert("Failed to duplicate.");
        }
    };

    // Calculate Stats
    const stats = {
        total: rawData.length,
        published: rawData.filter(p => p.status === 'PUBLISHED').length,
        scheduled: rawData.filter(p => p.status === 'SCHEDULED').length,
        drafts: rawData.filter(p => p.status === 'DRAFT').length
    };

    return {
        // Data
        posts: paginatedData,
        categories,
        loading,
        error,
        stats,

        // State
        view, setView,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortConfig, handleSort,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        selectedIds, totalPages, totalItems: processedData.length,

        // Handlers
        handleSelectAll,
        handleSelectOne,
        handleDelete,
        handleBulkDelete,
        handleDuplicate,
        refresh: fetchData
    };
};