import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPostsForAdmin as getPosts } from '../apiConfig';
// FIX: Removed 'FaEye' from imports
import { FaLinkedin, FaFileAlt, FaPlus, FaNewspaper, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ApiStatusPanel from '../components/ApiStatusPanel';

const DashboardPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://backend.treishvaamgroup.com';
    const linkedInAuthUrl = `${API_URL}/api/oauth2/authorization/linkedin`;

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

    const totalPublished = useMemo(() => posts.filter(p => p.status === 'PUBLISHED').length, [posts]);
    const totalScheduled = useMemo(() => posts.filter(p => p.status === 'SCHEDULED').length, [posts]);
    const totalDrafts = useMemo(() => posts.filter(p => p.status === 'DRAFT').length, [posts]);

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
                </div>
                <Link
                    to="/dashboard/blog/new"
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all active:scale-95"
                >
                    <FaPlus size={12} /> New Article
                </Link>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Published Posts"
                    value={totalPublished}
                    icon={FaNewspaper}
                    color="text-emerald-600"
                    bg="bg-emerald-50 border-emerald-100"
                />
                <StatCard
                    label="Scheduled"
                    value={totalScheduled}
                    icon={FaClock}
                    color="text-amber-600"
                    bg="bg-amber-50 border-amber-100"
                />
                <StatCard
                    label="Drafts"
                    value={totalDrafts}
                    icon={FaFileAlt}
                    color="text-slate-600"
                    bg="bg-slate-50 border-slate-200"
                />
                <IntegrationCard user={user} authUrl={linkedInAuthUrl} />
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* LEFT: API & SYSTEM STATUS (2 Columns Wide) */}
                <div className="xl:col-span-2">
                    <ApiStatusPanel />
                </div>

                {/* RIGHT: QUICK ACTIONS & ALERTS (1 Column Wide) */}
                <div className="xl:col-span-1 space-y-6">

                    {/* Recent Activity / Alerts */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 text-sm">System Alerts</h3>
                            {error && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">ERROR</span>}
                        </div>
                        <div className="p-4">
                            {error ? (
                                <div className="flex items-start gap-3 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                    <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 text-emerald-700 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                    <FaCheckCircle className="flex-shrink-0" />
                                    <p className="font-medium">All systems operational.</p>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Navigation</h4>
                                <nav className="space-y-2">
                                    <Link to="/dashboard/manage-posts" className="block px-3 py-2 text-sm text-gray-600 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                                        Manage All Posts &rarr;
                                    </Link>
                                    <Link to="/dashboard/audience" className="block px-3 py-2 text-sm text-gray-600 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                                        View Audience Report &rarr;
                                    </Link>
                                    <Link to="/dashboard/api-status" className="block px-3 py-2 text-sm text-gray-600 hover:text-slate-900 hover:bg-gray-50 rounded-lg transition-colors">
                                        Full API Logs &rarr;
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className={`p-5 rounded-xl border transition-all hover:shadow-md ${bg}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{label}</p>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            </div>
            <div className={`p-2.5 rounded-lg bg-white/60 ${color}`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const IntegrationCard = ({ user, authUrl }) => {
    const isConnected = user && user.linkedinConnected;
    return (
        <div className={`p-5 rounded-xl border transition-all hover:shadow-md ${isConnected ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">LinkedIn</p>
                    {isConnected ? (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-sm font-bold text-blue-700">Connected</span>
                        </div>
                    ) : (
                        <a href={authUrl} className="inline-block mt-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm transition-colors">
                            Connect Now
                        </a>
                    )}
                </div>
                <div className="p-2.5 rounded-lg bg-white/60 text-blue-700">
                    <FaLinkedin size={20} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;