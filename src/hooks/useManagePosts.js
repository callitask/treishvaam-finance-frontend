import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllPostsForAdmin, getDrafts, deletePost, duplicatePost, bulkDeletePosts, getCategories } from '../apiConfig';

export const useManagePosts = () => {
    const location = useLocation();
    const navigate = useNavigate();

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

    // --- 1. HANDLE HASH ROUTING (The "Drafts Page" Logic) ---
    useEffect(() => {
        if (location.hash === '#drafts') {
            setView('DRAFT');
        } else if (location.hash === '#scheduled') {
            setView('SCHEDULED');
        } else if (location.hash === '#published') {
            setView('PUBLISHED');
        }
    }, [location.hash]);

    // Update URL hash when view changes manually (optional, keeps UI in sync)
    const handleViewChange = (newView) => {
        setView(newView);
        setCurrentPage(1); // Reset page on view change
        if (newView === 'DRAFT') navigate('#drafts', { replace: true });
        else if (newView === 'SCHEDULED') navigate('#scheduled', { replace: true });
        else if (newView === 'PUBLISHED') navigate('#published', { replace: true });
        else navigate('#', { replace: true });
    };

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
            // Published/Scheduled come from main posts API
            const mainPosts = (postsRes.data || []).map(p => ({ ...p, _type: 'post' }));

            // Drafts come from drafts API, force status DRAFT if missing
            const drafts = (draftsRes.data || []).map(d => ({ ...d, _type: 'draft', status: 'DRAFT' }));

            // Combine all into one master list
            // Deduplicate by ID just in case an item appears in both lists temporarily
            const allItems = [...mainPosts, ...drafts];
            const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());

            setRawData(uniqueItems);
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

                // Date comparison
                if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
                    return sortConfig.direction === 'asc'
                        ? new Date(aVal) - new Date(bVal)
                        : new Date(bVal) - new Date(aVal);
                }

                // String comparison
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
            setRawData(prev => prev.filter(p => p.id !== id)); // Optimistic delete
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
            fetchData(); // Must refresh to get the new ID and slug
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
        view, setView: handleViewChange, // Use the wrapper to sync hash
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