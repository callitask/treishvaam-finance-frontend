/**
 * AI-CONTEXT:
 *
 * Purpose: Render the User Profile settings.
 *
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED (Phase 7 - Cloudflare UI Overhaul):
 * • Shifted layout from a centered card to a left-aligned, form-dense configuration.
 * • Replaced bulky input fields with `h-9` (36px) inputs and `text-[11px] uppercase tracking-wider text-slate-500` labels.
 * • Stripped heavy shadows and colors, enforcing a sharp 1px bordered slate aesthetic.
 */
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
        <div className="container mx-auto p-4 md:p-8 bg-white min-h-screen text-slate-900 font-sans">
            <div className="flex items-center space-x-3 mb-6 border-b border-slate-200 pb-4">
                <FaUser className="text-blue-600 text-xl" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Identity & Profile</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage author identity settings for SEO and Blog configurations.</p>
                </div>
            </div>

            <div className="max-w-2xl bg-white border border-slate-200 rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Read Only Email */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Primary Email</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-3 h-9 bg-slate-50 border border-slate-200 rounded text-sm text-slate-400 cursor-not-allowed outline-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Delegated via Keycloak Identity Server. Contact administrator to modify.</p>
                    </div>

                    {/* Display Name Input */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Author Display Name</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 h-9 border border-slate-300 rounded text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                                placeholder="e.g. Amitsagar Kandpal"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">This signature will index in Google Search schema and publish on article footers.</p>
                    </div>

                    {/* Feedback Message */}
                    {message.text && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {message.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 h-9 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Committing...' : <><FaSave size={12} /> Save Identity</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;