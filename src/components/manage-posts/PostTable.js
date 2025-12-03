import React from 'react';
import { FaEdit, FaTrash, FaCopy, FaEye, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../ResponsiveAuthImage';

const StatusBadge = ({ status }) => {
    const styles = {
        PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
        SCHEDULED: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    const style = styles[status] || styles.DRAFT;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${style}`}>
            {status}
        </span>
    );
};

const SortHeader = ({ label, sortKey, currentSort, onSort }) => {
    const isActive = currentSort.key === sortKey;
    return (
        <th
            className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                {isActive ? (
                    currentSort.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                ) : (
                    <FaSort className="opacity-30" />
                )}
            </div>
        </th>
    );
};

const PostTable = ({
    posts, loading, selectedIds, onSelectAll, onSelectOne,
    sortConfig, onSort, onDelete, onDuplicate
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <p className="text-gray-500 italic">No posts found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 w-12">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                                    checked={selectedIds.length > 0 && selectedIds.length === posts.length}
                                    onChange={onSelectAll}
                                />
                            </th>
                            <SortHeader label="Title" sortKey="title" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader label="Category" sortKey="category" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader label="Status" sortKey="status" currentSort={sortConfig} onSort={onSort} />
                            <SortHeader label="Date" sortKey="updatedAt" currentSort={sortConfig} onSort={onSort} />
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                            <tr key={post.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(post.id) ? 'bg-sky-50/50' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500 h-4 w-4"
                                        checked={selectedIds.includes(post.id)}
                                        onChange={() => onSelectOne(post.id)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 mr-4 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                            {post.thumbnails && post.thumbnails.length > 0 ? (
                                                <ResponsiveAuthImage
                                                    baseName={post.thumbnails[0].imageUrl}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 line-clamp-1 max-w-xs" title={post.title}>
                                                {post.title}
                                            </div>
                                            <div className="text-xs text-gray-500">{post.author || 'Unknown'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {post.category?.name || 'Uncategorized'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={post.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <Link
                                            to={`/dashboard/blog/edit/${post.userFriendlySlug}/${post.id}`}
                                            className="text-gray-400 hover:text-sky-600 transition-colors"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button
                                            onClick={() => onDuplicate(post.id)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                            title="Duplicate"
                                        >
                                            <FaCopy />
                                        </button>
                                        {post.status === 'PUBLISHED' && (
                                            <a
                                                href={`/category/${post.category?.slug}/${post.userFriendlySlug}/${post.urlArticleId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-gray-400 hover:text-green-600 transition-colors"
                                                title="View Live"
                                            >
                                                <FaEye />
                                            </a>
                                        )}
                                        <button
                                            onClick={() => onDelete(post.id)}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <FaTrash />
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