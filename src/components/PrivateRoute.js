import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // This prevents a redirect flicker while the auth state is loading
        return <div>Loading...</div>; 
    }

    if (!auth.isAuthenticated) {
        // If not authenticated, redirect to the login page
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If authenticated, render the child components (the dashboard)
    return children;
};

export default PrivateRoute;