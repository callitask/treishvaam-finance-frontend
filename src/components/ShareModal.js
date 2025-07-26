import React, { useState } from 'react';

const ShareModal = ({ post, onShare, onClose }) => {
    const [message, setMessage] = useState('');
    const [tags, setTags] = useState('');

    const handleShareClick = () => {
        onShare({
            postId: post.id,
            message,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
        });
    };
    
    const pageUrl = `https://treishfin.treishvaamgroup.com/blog/${post.id}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Share to LinkedIn</h2>
                <p className="mb-2 text-sm text-gray-600">
                    <strong>Post:</strong> {post.title}
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
                        placeholder={`Check out this article: ${post.title}\n\n${pageUrl}`}
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
