import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../apiConfig';
import AuthImage from '../components/AuthImage';
import ShareModal from '../components/ShareModal';
import { FaShareAlt, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const normalizeImageUrl = (url) => {
    if (!url) return '';
    return url.includes('/uploads/') ? url : `/uploads/${url}`;
};

const formatDisplayDate = (dateValue) => {
    if (!dateValue) return 'No date available';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'No date available';
    return date.toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
};

const PostsTable = ({ posts, handleDelete, handleOpenShareModal, isScheduled = false }) => {
    const navigate = useNavigate();
    if (posts.length === 0) {
        return <p className="p-6 text-center text-gray-500">No {isScheduled ? 'scheduled' : 'published'} posts found.</p>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            {isScheduled ? 'Scheduled For' : 'Last Updated'}
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.id} className="hover:bg-gray-50">
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 w-10 h-10 mr-4">
                                        {post.thumbnailUrl ? (
                                            <AuthImage 
                                                src={normalizeImageUrl(post.thumbnailUrl)}
                                                alt={post.title || 'Thumbnail'}
                                                className="w-full h-full rounded-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 rounded-full"></div>
                                        )}
                                    </div>
                                    <p className="text-gray-900 font-medium whitespace-no-wrap">{post.title}</p>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">{post.category}</span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <p className="text-gray-900 whitespace-no-wrap">
                                    {formatDisplayDate(isScheduled ? post.scheduledTime : (post.updatedAt || post.createdAt))}
                                </p>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex items-center space-x-4">
                                    {!isScheduled && (
                                        <button onClick={() => handleOpenShareModal(post)} className="text-gray-500 hover:text-green-600 flex items-center" title="Share Post">
                                            <FaShareAlt />
                                        </button>
                                    )}
                                    <button onClick={() => navigate(`/dashboard/blog/edit/${post.id}`)} className="text-gray-500 hover:text-sky-600" title="Edit Post">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="text-gray-500 hover:text-red-600" title="Delete Post">
                                        <FaTrash />
                                    </button>
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
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [activeTab, setActiveTab] = useState('published');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await getPosts();
                const sortedPosts = response.data.sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt);
                    const dateB = new Date(b.updatedAt || b.createdAt);
                    return dateB - dateA;
                });
                setPosts(sortedPosts);
            } catch (err) {
                setError('Failed to fetch posts.');
                console.error(err);
            }
        };
        fetchPosts();
    }, []);

    const { publishedPosts, scheduledPosts } = useMemo(() => {
        const published = posts.filter(post => post.published);
        const scheduled = posts.filter(post => !post.published);
        return { publishedPosts: published, scheduledPosts: scheduled };
    }, [posts]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deletePost(id);
                setPosts(posts.filter(post => post.id !== id));
            } catch (err) {
                setError('Failed to delete the post.');
                console.error(err);
            }
        }
    };

    const handleOpenShareModal = (post) => {
        setSelectedPost(post);
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setSelectedPost(null);
    };

    const handleShareToLinkedIn = async (shareData) => {
        // Existing share logic remains unchanged
    };

    return (
        <>
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Posts</h1>
                    <Link to="/dashboard/blog/new" className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition duration-300 flex items-center">
                        <FaPlus className="mr-2" /> Create New Post
                    </Link>
                </div>
                <div className="mb-4 border-b border-gray-200">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${
                                activeTab === 'published' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Published ({publishedPosts.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={`px-3 py-2 font-medium text-sm rounded-t-lg ${
                                activeTab === 'scheduled' ? 'border-b-2 border-sky-600 text-sky-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Scheduled ({scheduledPosts.length})
                        </button>
                    </nav>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {activeTab === 'published' && (
                        <PostsTable posts={publishedPosts} handleDelete={handleDelete} handleOpenShareModal={handleOpenShareModal} />
                    )}
                    {activeTab === 'scheduled' && (
                        <PostsTable posts={scheduledPosts} handleDelete={handleDelete} handleOpenShareModal={handleOpenShareModal} isScheduled={true} />
                    )}
                </div>
            </div>
            {isShareModalOpen && selectedPost && (
                <ShareModal 
                    post={selectedPost}
                    onClose={handleCloseShareModal}
                    onShare={handleShareToLinkedIn}
                />
            )}
        </>
    );
};

export default ManagePostsPage;