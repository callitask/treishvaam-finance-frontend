/**
 * AI-CONTEXT:
 * Purpose: Table to manage posts.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link.
 * - EDITED: Migrated to Cloudflare Radar enterprise aesthetic. Replaced `gray-*` palette with `slate-*`,
 * changed `rounded-xl` to `rounded`, tightened cell padding from `px-6 py-4` to `px-3 py-1.5`,
 * and reduced typography scale to `text-[11px]` for a high-density data grid.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 * It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React from 'react';
import { FaEdit, FaTrash, FaCopy, FaEye, FaSort, FaSortUp, FaSortDown, FaPenFancy } from 'react-icons/fa';
import Link from 'next/link';
import ResponsiveAuthImage from '../ResponsiveAuthImage';

const StatusBadge = ({ status }) => {
    const styles = {
        PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
        SCHEDULED: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    const style = styles[status] || styles.DRAFT;
    return (
        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${style}`}>
            {status}
        </span>
    );
};

const SortHeader = ({ label, sortKey, currentSort, onSort }) => {
    const isActive = currentSort.key === sortKey;
    return (
        <th
            className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none border-b border-slate-200 bg-slate-50"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    currentSort.direction === 'asc' ? <FaSortUp size={10} /> : <FaSortDown size={10} />
                ) : (
                    <FaSort size={10} className="opacity-30" />
                )}
            </div>
        </th>
    );
};

const PostTable = ({
    posts, currentView, loading, selectedIds, onSelectAll, onSelectOne,
    sortConfig, onSort, onDelete, onDuplicate }) => {
    const isDraftView = currentView === 'DRAFT';

    if (loading) {
        return (
            <div className="bg-white rounded border border-slate-200 p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-3 bg-slate-100 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded border border-slate-200 p-12 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    {isDraftView ? <FaPenFancy size={16} /> : <FaCopy size={16} />}
                </div>
                <h3 className="text-sm font-bold text-slate-800">No {isDraftView ? 'Drafts' : 'Posts'} Found</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                    {isDraftView ? 'Start writing a new story to see it here.' : 'Adjust your filters or create new content.'}
                </p>
                {isDraftView && (
                    <Link href="/dashboard/blog/new" className="mt-3 inline-block text-[11px] font-bold text-sky-700 hover:underline">
                        Create New Draft
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 w-8 border-b border-slate-200 bg-slate-50">
                                <input
                                    type="checkbox"
                                    className="rounded-sm border-slate-300 text-slate-800 focus:ring-slate-500 h-3 w-3"
                                    checked={selectedIds.length > 0 && selectedIds.length === posts.length}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <SortHeader label="Title" sortKey="title" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader label="Category" sortKey="category" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader
                                label={isDraftView ? "Last Saved" : "Date"}
                                sortKey="updatedAt"
                                currentSort={sortConfig}
                                onSort={onSort}
                            />
                            <th className="px-3 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {posts.map((post) => (
                            <tr key={post.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(post.id) ? 'bg-slate-50/80' : ''}`}>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded-sm border-slate-300 text-slate-800 focus:ring-slate-500 h-3 w-3"
                                        checked={selectedIds.includes(post.id)}
                                        onChange={() => onSelectOne(post.id)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 flex-shrink-0 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                                            {post.thumbnails && post.thumbnails.length > 0 ? (
                                                <ResponsiveAuthImage
                                                    baseName={post.thumbnails[0].imageUrl}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-400 text-[8px] font-bold">IMG</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-slate-800 line-clamp-1 max-w-[200px]" title={post.title}>
                                                {post.title}
                                            </div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-0.5">{post.author || 'Unknown'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-[11px] text-slate-600 font-medium">
                                    {post.category?.name || 'Uncategorized'}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <StatusBadge status={post.status} />
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-[10px] text-slate-500 font-mono">
                                    {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                                    <span className="block text-[9px] text-slate-400 mt-0.5">
                                        {new Date(post.updatedAt || post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-right font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Link
                                            href={`/dashboard/blog/edit/${post.userFriendlySlug}/${post.id}`}
                                            className={`flex items-center gap-1 transition-colors ${isDraftView ? 'text-slate-800 font-bold hover:text-sky-700' : 'text-slate-400 hover:text-slate-800'}`}
                                            title="Edit"
                                        >
                                            <FaEdit size={12} />
                                            {isDraftView && <span className="text-[10px]">Edit</span>}
                                        </Link>
                                        <button
                                            onClick={() => onDuplicate(post.id)}
                                            className="text-slate-400 hover:text-slate-800 transition-colors p-1"
                                            title="Duplicate"
                                        >
                                            <FaCopy size={11} />
                                        </button>
                                        {post.status === 'PUBLISHED' && (
                                            <Link
                                                href={`/category/${post.category?.slug}/${post.userFriendlySlug}/${post.urlArticleId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                                                title="View Live"
                                            >
                                                <FaEye size={12} />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => onDelete(post.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-1 ml-1"
                                            title="Delete"
                                        >
                                            <FaTrash size={11} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostTable;