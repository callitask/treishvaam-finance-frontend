import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../apiConfig';
import { FaUser, FaSave, FaCheck, FaExclamationCircle } from 'react-icons/fa';

const ProfilePage = () => {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        } else if (user?.name) {
            setDisplayName(user.name);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUserProfile({ displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully. Please refresh to see changes.' });

            // Optional: Force reload to sync Context
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to update profile. Try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
                <p className="text-slate-500 mt-2">Update your public author identity for SEO and Blog Posts.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">

                    {/* Read Only Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">Managed by Keycloak Identity Server.</p>
                    </div>

                    {/* Display Name Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name (Author Name)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                placeholder="e.g. Amitsagar Kandpal"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This name will appear as the "Author" in Google Search results and on your blog posts.</p>
                    </div>

                    {/* Feedback Message */}
                    {message.text && (
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;