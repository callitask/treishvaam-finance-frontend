import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllPostsForAdmin, getDrafts, deletePost, duplicatePost, bulkDeletePosts, getCategories } from '../apiConfig';

/**
 * AI-CONTEXT:
 * Purpose: Hook to manage blog posts in dashboard.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/navigation.
 */
export const useManagePosts = () => {
    const router = useRouter();

    const [rawData, setRawData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [view, setView] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'updatedAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash;
            if (hash === '#drafts') setView('DRAFT');
            else if (hash === '#scheduled') setView('SCHEDULED');
            else if (hash === '#published') setView('PUBLISHED');
        }
    }, []);

    const handleViewChange = (newView) => {
        setView(newView);
        setCurrentPage(1);
        if (typeof window !== 'undefined') {
            if (newView === 'DRAFT') router.replace('#drafts', { scroll: false });
            else if (newView === 'SCHEDULED') router.replace('#scheduled', { scroll: false });
            else if (newView === 'PUBLISHED') router.replace('#published', { scroll: false });
            else router.replace('#', { scroll: false });
        }
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [postsRes, draftsRes, catsRes] = await Promise.all([
                getAllPostsForAdmin(),
                getDrafts(),
                getCategories()
            ]);

            const mainPosts = (postsRes.data || []).map(p => ({ ...p, _type: 'post' }));
            const drafts = (draftsRes.data || []).map(d => ({ ...d, _type: 'draft', status: 'DRAFT' }));

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

    const processedData = useMemo(() => {
        let data = [...rawData];

        if (view !== 'ALL') {
            data = data.filter(item => item.status === view);
        }

        if (selectedCategory !== 'All') {
            data = data.filter(item => item.category?.name === selectedCategory);
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            data = data.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.author && item.author.toLowerCase().includes(lowerQuery))
            );
        }

        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
                    return sortConfig.direction === 'asc'
                        ? new Date(aVal) - new Date(bVal)
                        : new Date(bVal) - new Date(aVal);
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [rawData, view, selectedCategory, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedData.slice(start, start + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

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
            fetchData();
            alert("Post duplicated as draft.");
        } catch (err) {
            alert("Failed to duplicate.");
        }
    };

    const stats = {
        total: rawData.length,
        published: rawData.filter(p => p.status === 'PUBLISHED').length,
        scheduled: rawData.filter(p => p.status === 'SCHEDULED').length,
        drafts: rawData.filter(p => p.status === 'DRAFT').length
    };

    return {
        posts: paginatedData,
        categories,
        loading,
        error,
        stats,
        view, setView: handleViewChange,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortConfig, handleSort,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        selectedIds, totalPages, totalItems: processedData.length,
        handleSelectAll,
        handleSelectOne,
        handleDelete,
        handleBulkDelete,
        handleDuplicate,
        refresh: fetchData
    };
};