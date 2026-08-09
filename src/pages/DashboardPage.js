"use client";
/**
 * AI-CONTEXT:
 * Purpose: Main dashboard landing page.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Migrated from react-router-dom to next/link.
 * - EDITED: Migrated REACT_APP_API_BASE_URL to NEXT_PUBLIC_API_BASE_URL.
 * - EDITED (Phase 7 - Cloudflare UI Overhaul):
 * • Compacted KPI ribbon, removing heavily rounded corners and colored backgrounds in favor of a dense, monochromatic slate palette.
 * • Condensed Quick Navigation and System Alerts into a high-density vertical list with 1px borders and text-[11px] tracking.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllPostsForAdmin as getPosts } from '../apiConfig';
import { FaLinkedin, FaFileAlt, FaPlus, FaNewspaper, FaClock, FaCheckCircle, FaExclamationTriangle, FaUserEdit } from 'react-icons/fa';
import Link from 'next/link';
import ApiStatusPanel from '../components/ApiStatusPanel';

const DashboardPage = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://backend.treishvaamgroup.com';

    const linkedInAuthUrl = `${API_URL}/api/v1/oauth2/authorization/linkedin`;

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
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6 font-sans text-slate-900 bg-white min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Welcome back, {user?.name || 'Admin'}. System telemetry and metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/profile" className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded text-[11px] font-semibold transition-colors">
                        <FaUserEdit size={12} /> Profile
                    </Link>
                    <Link href="/dashboard/blog/new" className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded text-[11px] font-semibold transition-colors">
                        <FaPlus size={10} /> New Article
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Published" value={totalPublished} icon={FaNewspaper} />
                <StatCard label="Scheduled" value={totalScheduled} icon={FaClock} />
                <StatCard label="Drafts" value={totalDrafts} icon={FaFileAlt} />
                <IntegrationCard user={user} authUrl={linkedInAuthUrl} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3">
                    <ApiStatusPanel />
                </div>
                <div className="xl:col-span-1 space-y-4">
                    <div className="bg-white rounded border border-slate-200 overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">System Alerts</h3>
                            {error && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">ERROR</span>}
                        </div>
                        <div className="p-3">
                            {error ? (
                                <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 p-2 rounded border border-red-100">
                                    <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 p-2 rounded border border-emerald-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                    <p className="font-medium">All infrastructure routing optimally.</p>
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quick Navigation</h4>
                                <nav className="space-y-1">
                                    <Link href="/dashboard/manage-posts" className="flex justify-between items-center px-2 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors">
                                        <span>Manage Content</span>
                                        <span className="text-slate-300">&rarr;</span>
                                    </Link>
                                    <Link href="/dashboard/audience" className="flex justify-between items-center px-2 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors">
                                        <span>Audience Intelligence</span>
                                        <span className="text-slate-300">&rarr;</span>
                                    </Link>
                                    <Link href="/dashboard/api-status" className="flex justify-between items-center px-2 py-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded transition-colors">
                                        <span>Gateway Logs</span>
                                        <span className="text-slate-300">&rarr;</span>
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

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="p-4 rounded border border-slate-200 bg-white transition-colors hover:border-slate-300">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
                <h3 className="text-xl font-semibold text-slate-900">{value}</h3>
            </div>
            <div className="text-slate-400"><Icon size={16} /></div>
        </div>
    </div>
);

const IntegrationCard = ({ user, authUrl }) => {
    const isConnected = user && user.linkedinConnected;
    return (
        <div className="p-4 rounded border border-slate-200 bg-white transition-colors hover:border-slate-300">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">LinkedIn</p>
                    {isConnected ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[11px] font-medium text-slate-700">Connected</span>
                        </div>
                    ) : (
                        <a href={authUrl} className="inline-block mt-0.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-colors">Connect Now &rarr;</a>
                    )}
                </div>
                <div className="text-slate-400"><FaLinkedin size={16} /></div>
            </div>
        </div>
    );
};

export default DashboardPage;