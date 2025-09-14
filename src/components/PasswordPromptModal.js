import React, { useState } from 'react';

const PasswordPromptModal = ({ isOpen, onClose, onConfirm, title, isLoading }) => {
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(password);
        setPassword('');
    };
    
    const handleClose = () => {
        setPassword('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
                <p className="text-sm text-gray-600 mb-4">
                    This is a destructive action. To confirm, please enter your admin password.
                </p>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your password"
                    autoFocus
                />
                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!password || isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? 'Flushing...' : 'Confirm & Flush'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordPromptModal;
