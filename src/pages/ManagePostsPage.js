import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useManagePosts } from '../hooks/useManagePosts';

// Sub-components
import PostStatsRibbon from '../components/manage-posts/PostStatsRibbon';
import PostFilterBar from '../components/manage-posts/PostFilterBar';
import PostTable from '../components/manage-posts/PostTable';
import PaginationControls from '../components/manage-posts/PaginationControls';

const ManagePostsPage = () => {
    // Hooks encapsulate all logic
    const {
        posts, categories, loading, error, stats,
        view, setView,
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortConfig, handleSort,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        selectedIds, handleSelectAll, handleSelectOne,
        handleDelete, handleBulkDelete, handleDuplicate,
        totalItems, totalPages
    } = useManagePosts();

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                    <p className="text-slate-500 mt-1 text-sm">Create, edit, and organize your digital assets.</p>
                </div>
                <Link
                    to="/dashboard/blog/new"
                    className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition-all transform active:scale-95"
                >
                    <FaPlus size={14} /> Create New
                </Link>
            </div>

            {/* Visual Stats */}
            <PostStatsRibbon
                stats={stats}
                currentView={view}
                onViewChange={setView}
            />

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700 rounded-r shadow-sm">
                    <p className="font-bold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Controls */}
            <PostFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedCount={selectedIds.length}
                onBulkDelete={handleBulkDelete}
            />

            {/* Data Grid */}
            <PostTable
                posts={posts}
                loading={loading}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                sortConfig={sortConfig}
                onSort={handleSort}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
            />

            {/* Pagination */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            />
        </div>
    );
};

export default ManagePostsPage;