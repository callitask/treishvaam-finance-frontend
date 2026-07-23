/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Renders a modal for sharing the current post to LinkedIn.
 *
 * Scope:
 * - Client-side UI component for social sharing.
 *
 * Critical Dependencies:
 * - None.
 *
 * Security Constraints:
 * - Must not execute unsafe DOM injections.
 *
 * Non-Negotiables:
 * - Must respect `isOpen` prop to prevent rendering when closed.
 *
 * Change Intent:
 * - Upgraded legacy component to respect `isOpen`, `url`, and `title` props.
 * - Removed hardcoded legacy domain (treishfin.treishvaamgroup.com).
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Initial AI-CONTEXT block.
 * • Added `isOpen` visibility guard (`if (!isOpen) return null;`).
 * • Replaced hardcoded legacy URL with dynamic `url` prop to respect dynamic domain routing.
 * • Replaced hardcoded `post.title` with dynamic `title` prop to prevent undefined crashes.
 * 
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { useState } from 'react';

const ShareModal = ({ isOpen, post, onShare, onClose, url, title }) => {
    const [message, setMessage] = useState('');
    const [tags, setTags] = useState('');

    if (!isOpen) return null;

    const handleShareClick = () => {
        if (onShare) {
            onShare({
                postId: post?.id,
                message,
                tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
            });
        }
    };

    const pageUrl = url || `https://treishvaamfinance.com/blog/${post?.id || ''}`;
    const displayTitle = title || post?.title || 'Article';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Share to LinkedIn</h2>
                <p className="mb-2 text-sm text-gray-600">
                    <strong>Post:</strong> {displayTitle}
                </p>
                <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Message (Optional)
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows="4"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder={`Check out this article: ${displayTitle}\n\n${pageUrl}`}
                    ></textarea>
                </div>
                <div className="mb-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        Hashtags (comma-separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        placeholder="e.g., #finance, #investing, #fintech"
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShareClick}
                        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Share to LinkedIn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;