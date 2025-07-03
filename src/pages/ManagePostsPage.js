import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Link } from 'react-router-dom';

const ManagePostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await apiClient.get('/posts');
      setPosts(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiClient.delete(`/posts/${postId}`);
        fetchPosts(); // Refresh the list
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  if (loading) return <p className="p-8">Loading posts...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Blog Posts</h1>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {posts.length > 0 ? posts.map(post => (
            <li key={post.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{post.title} {post.isFeatured && <span className="text-xs bg-yellow-200 text-yellow-800 font-bold px-2 py-1 rounded-full ml-2">Featured</span>}</p>
                <p className="text-sm text-gray-500">Published on: {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="space-x-2">
                <Link to={`/dashboard/edit-post/${post.id}`} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">Edit</Link>
                <button onClick={() => handleDelete(post.id)} className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700">Delete</button>
              </div>
            </li>
          )) : (
            <li className="p-4 text-center text-gray-500">You haven't created any posts yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ManagePostsPage;