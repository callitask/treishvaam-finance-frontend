import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const ManagePostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const { token } = useAuth();

  const postsPerPage = 10; // You can adjust this value

  // Debounce search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: postsPerPage,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      });
      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      // NOTE: Your backend must support all these query parameters.
      const response = await fetch(`${API_BASE_URL}/api/blog/posts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch posts.');
      
      const data = await response.json(); // Expects { posts: [], totalPages: X }
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, sortConfig]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Post deleted successfully.');
        // If the last item on a page is deleted, go to the previous page.
        if (posts.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          fetchPosts(); // Re-fetch to get the latest data for the current page
        }
      } else {
        const errorData = await response.json();
        alert(`Failed to delete post: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      alert('An error occurred while deleting the post.');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortableHeader = ({ children, columnKey }) => {
    const isSorted = sortConfig.key === columnKey;
    return (
      <button onClick={() => handleSort(columnKey)} className="flex items-center font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
        {children}
        {isSorted && <span className="ml-2">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
      </button>
    );
  };

  if (isLoading) return <div className="text-center p-8">Loading posts...</div>;
  if (error) return <div className="text-center p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Blog Posts</h1>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs"><SortableHeader columnKey="title">Title</SortableHeader></th>
              <th scope="col" className="px-6 py-3 text-left text-xs"><SortableHeader columnKey="category">Category</SortableHeader></th>
              <th scope="col" className="px-6 py-3 text-left text-xs"><SortableHeader columnKey="createdAt">Date</SortableHeader></th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.length > 0 ? posts.map(post => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/dashboard/edit/${post.id}`} className="text-sky-600 hover:text-sky-900 mr-4">Edit</Link>
                  <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            )) : (<tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">No posts found.</td></tr>)}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ManagePostsPage;