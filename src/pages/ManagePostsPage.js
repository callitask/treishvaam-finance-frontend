"use client";
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useManagePosts } from '../hooks/useManagePosts';
import PostStatsRibbon from '../components/manage-posts/PostStatsRibbon';
import PostFilterBar from '../components/manage-posts/PostFilterBar';
import PostTable from '../components/manage-posts/PostTable';
import PaginationControls from '../components/manage-posts/PaginationControls';

/**
 * AI-CONTEXT:
 * Purpose: Manage posts dashboard page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link.
 */
const ManagePostsPage = () => {
    const {
        posts, categories, loading, error, stats,
        view, setView, searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        sortConfig, handleSort, currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage, selectedIds,
        totalPages, totalItems, handleSelectAll,
        handleSelectOne, handleDelete, handleBulkDelete, handleDuplicate
    } = useManagePosts();

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Content Library</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage and track your published articles and drafts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/blog/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                    >
                        Create New Article
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
            )}

            <PostStatsRibbon stats={stats} currentView={view} onViewChange={setView} />

            <PostFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                selectedCount={selectedIds.length}
                onBulkDelete={handleBulkDelete}
            />

            <div className="flex-grow flex flex-col">
                <PostTable
                    posts={posts}
                    currentView={view}
                    loading={loading}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                />

                {!loading && posts.length > 0 && (
                    <div className="mt-auto pt-6 pb-2">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePostsPage;