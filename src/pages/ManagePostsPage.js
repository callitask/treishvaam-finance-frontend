import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost, API_URL } from '../apiConfig';

const ManagePostsPage = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
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

    const formatDisplayDate = (dateValue) => {
        if (!dateValue) return 'No date available';
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'No date available';
        
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
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
                                    {/* --- FIX: Re-added the thumbnail image display --- */}
                                    <div className="flex items-center">
                                        {post.thumbnailUrl && (
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full object-cover" src={`${API_URL}${post.thumbnailUrl}`} alt="Thumbnail" />
                                            </div>
                                        )}
                                        <div className="ml-3">
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
                                    <button onClick={() => navigate(`/dashboard/blog/edit/${post.id}`)} className="text-sky-600 hover:text-sky-900 mr-3">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagePostsPage;