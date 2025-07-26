import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FaLinkedin } from 'react-icons/fa';


const DashboardPage = () => {
    const { user } = useAuth();
    const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
    const linkedInAuthUrl = `${API_URL}/oauth2/authorization/linkedin`;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing dashboard cards can go here */}

                {/* --- LinkedIn Integration Card --- */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Integrations</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FaLinkedin className="text-2xl text-blue-700 mr-3" />
                            <span className="font-medium">LinkedIn</span>
                        </div>
                        {user && user.linkedinConnected ? (
                            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                Connected
                            </div>
                        ) : (
                            <a 
                                href={linkedInAuthUrl} 
                                className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                            >
                                Connect
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Connect your LinkedIn account to enable direct sharing of blog posts from the admin panel.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
