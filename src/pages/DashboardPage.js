import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPostsForAdmin as getPosts } from '../apiConfig';
import { FaLinkedin, FaFileAlt, FaEye, FaPlusSquare } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ResponsiveAuthImage from '../components/ResponsiveAuthImage';
import ApiStatusPanel from '../components/ApiStatusPanel';

const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://backend.treishvaamgroup.com';
    const linkedInAuthUrl = `${API_URL}/oauth2/authorization/linkedin`;

    useEffect(() => {
        const fetchPostsForStats = async () => {
            try {
                const response = await getPosts();
                setPosts(response.data);
            } catch (err) {
                setError('Could not load dashboard data.');
                console.error(err);
            }
        };
        fetchPostsForStats();
        const intervalId = setInterval(fetchPostsForStats, 30000);

        return () => clearInterval(intervalId);
    }, []);

    const recentPosts = useMemo(() => {
        return [...posts]
            .filter(p => p.status === 'PUBLISHED')
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5);
    }, [posts]);

    const totalPublishedPosts = useMemo(() => posts.filter(p => p.status === 'PUBLISHED').length, [posts]);
    const totalScheduledPosts = useMemo(() => posts.filter(p => p.status === 'SCHEDULED').length, [posts]);

    return (
        <div className="container mx-auto p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome, {user?.name || 'Admin'}!</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<FaFileAlt className="text-white" />} title="Published Posts" value={totalPublishedPosts} color="bg-sky-500" />
                <StatCard icon={<FaEye className="text-white" />} title="Scheduled Posts" value={totalScheduledPosts} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <ApiStatusPanel />
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
                        <Link to="/dashboard/blog/new" className="w-full flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition duration-300">
                            <FaPlusSquare className="mr-2" /> Create New Post
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Integrations</h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <FaLinkedin className="text-2xl text-blue-700 mr-3" />
                                <span className="font-medium">LinkedIn</span>
                            </div>
                            {user && user.linkedinConnected ? (
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                    Connected
                                </span>
                            ) : (
                                <a href={linkedInAuthUrl} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300">
                                    Connect
                                </a>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            Connect your LinkedIn account to enable direct sharing of blog posts.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Posts</h2>
                    <div className="space-y-4">
                        {error && <p className="text-red-500">{error}</p>}
                        {recentPosts.length > 0 ? (
                            recentPosts.map(post => (
                                <div key={post.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 flex-shrink-0 mr-4">
                                            <ResponsiveAuthImage
                                                baseName={post.thumbnails && post.thumbnails.length > 0 ? post.thumbnails[0].imageUrl : null}
                                                alt={post.title}
                                                className="w-full h-full rounded-lg object-cover"
                                                sizes="48px"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{post.title}</p>
                                            <p className="text-xs text-gray-500">
                                                Published on {new Date(post.updatedAt || post.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/dashboard/blog/edit/${post.userFriendlySlug}/${post.id}`} className="text-sky-600 hover:underline text-sm font-semibold">
                                        Edit
                                    </Link>
                                </div>
                            ))
                        ) : (
                            !error && <p className="text-center text-gray-500 py-4">No recent posts to display.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;