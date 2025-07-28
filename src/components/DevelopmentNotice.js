import React, { useState, useEffect } from 'react';

const DevelopmentNotice = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasBeenShown = localStorage.getItem('developmentNoticeShown');
        if (!hasBeenShown) {
            setIsVisible(true);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem('developmentNoticeShown', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6 md:p-8 text-center border-t-4 border-sky-500">
                <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Welcome to Our Development Site</h2>
                <p className="text-gray-600 mb-6">
                    Thank you for visiting. Please be aware that this website is currently in a pre-release phase. Our team is actively testing features using placeholder data. The final version will be launched soon. We appreciate your patience and understanding.
                </p>
                <button
                    onClick={handleClose}
                    className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-300"
                >
                    Okay, I Understand
                </button>
            </div>
        </div>
    );
};

export default DevelopmentNotice;
