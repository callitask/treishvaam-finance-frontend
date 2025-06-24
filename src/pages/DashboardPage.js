import React from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const { token } = useAuth();
    let userName = 'User';

    if (token) {
        try {
            // Decode the JWT to get the username (subject)
            const payload = JSON.parse(atob(token.split('.')[1]));
            userName = payload.sub;
        } catch (e) {
            console.error("Failed to decode JWT", e);
        }
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Hi {userName},</h1>
            <p className="mt-4 text-lg text-gray-600">The website is currently under development. We will notify you once we are Live.</p>
            <p className="mt-2 text-gray-600">Thanks for landing by.</p>
        </div>
    );
};

export default DashboardPage;
