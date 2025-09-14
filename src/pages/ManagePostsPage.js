import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllPostsForAdmin as getPosts, deletePost, getDrafts, duplicatePost, bulkDeletePosts } from '../apiConfig';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ShareModal from '../components/ShareModal';
import { FaShareAlt, FaEdit, FaTrash, FaPlus, FaCopy } from 'react-icons/fa';

const formatDisplayDate = (dateValue) => {
    if (!dateValue) return 'No date available';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'No date available';
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const formatLayoutStyle = (style) => {
    if (!style || style === 'DEFAULT') return 'Masonry';
    if (style === 'BANNER') return 'Banner';
    if (style.startsWith('MULTI_COLUMN_')) {
        const count = style.split('_')[2];
        return `${count} Column Row`;
    }
    return style;
};

const PostsTable = ({
    posts,
    handleDelete,
    handleDuplicate,
    handleOpenShareModal,
    isScheduled = false,
    isDraft = false,
    selectedPostIds,
    onSelectOne,
    onSelectAll,
    isAddColumnDisabled
}) => {
    const navigate = useNavigate();
    const isAllSelected = useMemo(() => posts.length > 0 && selectedPostIds.length === posts.length, [selectedPostIds, posts]);

    if (!posts || posts.length === 0) {
        return <p className="p-6 text-center text-gray-500">No {isDraft ? 'drafts' : (isScheduled ? 'scheduled' : 'published')} posts found.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left">
                           <input type="checkbox" className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500" checked={isAllSelected} onChange={onSelectAll} />
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Post Layout</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {isDraft ? 'Last Saved' : (isScheduled ? 'Scheduled For' : 'Last Updated')}
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id} className={`hover:bg-gray-50 ${selectedPostIds.includes(post.id) ? 'bg-sky-50' : ''}`}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-sky-600 rounded focus:ring-sky-500" checked={selectedPostIds.includes(post.id)} onChange={() => onSelectOne(post.id)} />
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 mr-4">
                                        <ResponsiveAuthImage baseName={post.thumbnails && post.thumbnails.length > 0 ? post.thumbnails[0].imageUrl : null} alt={post.title} className="w-full h-full rounded-full object-cover" sizes="40px" />
                                    </div>
                                    <p className="text-gray-900 font-medium">{post.title}</p>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">{post.category || 'N/A'}</span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className="text-gray-800">{formatLayoutStyle(post.layoutStyle)}</span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900">{formatDisplayDate(isScheduled ? post.scheduledTime : (post.updatedAt || post.createdAt))}</p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center space-x-4">
                                    {!isScheduled && !isDraft && <button onClick={() => handleOpenShareModal(post)} className="text-gray-500 hover:text-green-600" title="Share"><FaShareAlt /></button>}
                                    <button onClick={() => navigate(`/dashboard/blog/edit/${post.slug}`)} className="text-gray-500 hover:text-sky-600" title="Edit"><FaEdit /></button>
                                    <button onClick={() => handleDelete(post.id)} className="text-gray-500 hover:text-red-600" title="Delete"><FaTrash /></button>
                                    {post.layoutStyle && post.layoutStyle.startsWith('MULTI_COLUMN') && (
                                        <button
                                            onClick={() => handleDuplicate(post.id)}
                                            className={`text-gray-500 ${isAddColumnDisabled(post.layoutGroupId, post.layoutStyle) ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-600'}`}
                                            title={isAddColumnDisabled(post.layoutGroupId, post.layoutStyle) ? "Group is full" : "Add post column"}
                                            disabled={isAddColumnDisabled(post.layoutGroupId, post.layoutStyle)}
                                        >
                                            <FaCopy />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ManagePostsPage = () => {
    const location = useLocation();
    const [allPosts, setAllPosts] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [error, setError] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeTab, setActiveTab] = useState('published');
    const [selectedPostIds, setSelectedPostIds] = useState([]);

    const fetchAllData = useCallback(async () => {
        try {
            const [postsRes, draftsRes] = await Promise.all([getPosts(), getDrafts()]);
            setAllPosts(postsRes.data || []);
            setDrafts(draftsRes.data || []);
        } catch (err) {
            setError('Failed to fetch posts or drafts.');
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        if (location.hash === '#drafts') {
            setActiveTab('drafts');
        }
    }, [location.hash]);

    useEffect(() => {
        setSelectedPostIds([]);
    }, [activeTab]);

    const { publishedPosts, scheduledPosts } = useMemo(() => {
        const published = allPosts.filter(p => p.status === 'PUBLISHED');
        const scheduled = allPosts.filter(p => p.status === 'SCHEDULED');
        return { publishedPosts: published, scheduledPosts: scheduled };
    }, [allPosts]);

    const layoutGroupCounts = useMemo(() => {
        const counts = {};
        [...allPosts, ...drafts].forEach(p => {
            if (p.layoutGroupId) {
                counts[p.layoutGroupId] = (counts[p.layoutGroupId] || 0) + 1;
            }
        });
        return counts;
    }, [allPosts, drafts]);

    const isAddColumnDisabled = useCallback((groupId, layoutStyle) => {
        if (!groupId || !layoutStyle || !layoutStyle.startsWith('MULTI_COLUMN')) {
            return true;
        }
        try {
            const limit = parseInt(layoutStyle.split('_')[2], 10);
            const currentCount = layoutGroupCounts[groupId] || 0;
            return currentCount >= limit;
        } catch {
            return true;
        }
    }, [layoutGroupCounts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(id);
                await fetchAllData();
            } catch (err) {
                setError('Failed to delete the post.');
            }
        }
    };

    const handleDuplicate = async (id) => {
        if (window.confirm('This will create a new draft by duplicating the selected post\'s layout. Continue?')) {
            try {
                await duplicatePost(id);
                await fetchAllData();
                setActiveTab('drafts');
            } catch (err) {
                setError('Failed to duplicate the post.');
                console.error(err);
            }
        }
    };

    const handleOpenShareModal = (post) => {
        setSelectedPost(post);
        setIsShareModalOpen(true);
    };

    const handleSelectOne = (postId) => {
        setSelectedPostIds(prev =>
            prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
        );
    };
    
    const currentVisiblePosts = useMemo(() => {
        if (activeTab === 'published') return publishedPosts;
        if (activeTab === 'drafts') return drafts;
        if (activeTab === 'scheduled') return scheduledPosts;
        return [];
    }, [activeTab, publishedPosts, drafts, scheduledPosts]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const postIds = currentVisiblePosts.map(p => p.id);
            setSelectedPostIds(postIds);
        } else {
            setSelectedPostIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedPostIds.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedPostIds.length} selected post(s)?`)) {
            try {
                await bulkDeletePosts(selectedPostIds);
                setSelectedPostIds([]);
                await fetchAllData();
            } catch (err) {
                setError('Failed to delete the selected posts.');
                console.error(err);
            }
        }
    };
    
    const tableProps = {
        handleDelete,
        handleDuplicate,
        handleOpenShareModal,
        selectedPostIds,
        onSelectOne: handleSelectOne,
        isAddColumnDisabled
    };

    return (
        <>
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Posts</h1>
                    <Link to="/dashboard/blog/new" className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition flex items-center">
                        <FaPlus className="mr-2" /> Create New Post
                    </Link>
                </div>

                {selectedPostIds.length > 0 && (
                    <div className="mb-4 p-3 bg-sky-100 border border-sky-200 rounded-lg flex items-center gap-4">
                        <p className="text-sm font-semibold text-sky-800">{selectedPostIds.length} post(s) selected.</p>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-red-700 transition flex items-center"
                        >
                            <FaTrash className="mr-2" /> Delete Selected
                        </button>
                    </div>
                )}
                
                <div className="mb-4 border-b border-gray-200">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('published')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'published' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Published ({publishedPosts.length})
                        </button>
                        <button onClick={() => setActiveTab('drafts')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'drafts' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Drafts ({drafts.length})
                        </button>
                        <button onClick={() => setActiveTab('scheduled')} className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'scheduled' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            Scheduled ({scheduledPosts.length})
                        </button>
                    </nav>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {activeTab === 'published' && <PostsTable posts={publishedPosts} {...tableProps} onSelectAll={handleSelectAll} />}
                    {activeTab === 'drafts' && <PostsTable posts={drafts} {...tableProps} onSelectAll={handleSelectAll} isDraft={true} />}
                    {activeTab === 'scheduled' && <PostsTable posts={scheduledPosts} {...tableProps} onSelectAll={handleSelectAll} isScheduled={true} />}
                </div>
            </div>
            {isShareModalOpen && <ShareModal post={selectedPost} onClose={() => setIsShareModalOpen(false)} />}
        </>
    );
};

export default ManagePostsPage;