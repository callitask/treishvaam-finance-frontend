import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../apiConfig';
import AuthImage from '../components/AuthImage';
import ShareModal from '../components/ShareModal'; // Import the modal
import { FaShareAlt } from 'react-icons/fa'; // Import an icon

const normalizeImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
        return url;
    }
    return `/uploads/${url}`;
};

const ManagePostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const navigate = useNavigate();

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
    
    // --- Handlers for Share Modal ---
    const handleOpenShareModal = (post) => {
        setSelectedPost(post);
        setIsShareModalOpen(true);
    };

    const handleCloseShareModal = () => {
        setIsShareModalOpen(false);
        setSelectedPost(null);
    };
    
    const handleShareToLinkedIn = async (shareData) => {
        console.log("Sharing data:", shareData);
        // This is where we will call the backend API endpoint
        // For now, it's a placeholder
        try {
            // This assumes you have a function in apiConfig.js like:
            // export const sharePostToLinkedIn = (id, data) => api.post(`/posts/${id}/share`, data);
            // await sharePostToLinkedIn(shareData.postId, { message: shareData.message, tags: shareData.tags });
            alert('Post shared successfully to LinkedIn! (Frontend placeholder)');
        } catch (error) {
            console.error('Failed to share post:', error);
            alert('Failed to share post to LinkedIn.');
        }
        handleCloseShareModal();
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

    return (
        <>
            <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Posts</h1>
                    <Link to="/dashboard/blog/new" className="bg-sky-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-700 transition duration-300">
                        + Create New Post
                    </Link>
                </div>
                {error && <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10 mr-3">
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
                                            <div className="ml-0">
                                                <p className="text-gray-900 whitespace-no-wrap">{post.title}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">{post.category}</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">
                                            {formatDisplayDate(post.updatedAt || post.createdAt)}
                                        </p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center space-x-3">
                                            <button onClick={() => handleOpenShareModal(post)} className="text-green-600 hover:text-green-900 flex items-center" title="Share Post">
                                                <FaShareAlt /> <span className="ml-1">Share</span>
                                            </button>
                                            <button onClick={() => navigate(`/dashboard/blog/edit/${post.id}`)} className="text-sky-600 hover:text-sky-900">Edit</button>
                                            <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Render Share Modal --- */}
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