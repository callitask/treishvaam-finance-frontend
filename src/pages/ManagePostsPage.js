"use client";
/**
 * AI-CONTEXT:
 * Purpose: Manage posts dashboard page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link.
 * - EDITED (Phase 7 - Cloudflare UI Overhaul):
 * • Streamlined container padding and header typography to match high-density slate aesthetic.
 * • Prepared outer layout for strict Data Grid rendering, removing heavy shadows and spacing.
 */
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useManagePosts } from '../hooks/useManagePosts';
import PostStatsRibbon from '../components/manage-posts/PostStatsRibbon';
import PostFilterBar from '../components/manage-posts/PostFilterBar';
import PostTable from '../components/manage-posts/PostTable';
import PaginationControls from '../components/manage-posts/PaginationControls';

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
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] flex flex-col space-y-4 font-sans text-slate-900 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Content Library</h1>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 uppercase tracking-wider">Manage published articles and drafts</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/blog/new"
                        className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded transition-colors whitespace-nowrap"
                    >
                        Create Article
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs font-medium">
                    {error}
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
                    <div className="mt-4 pt-4 border-t border-slate-100">
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