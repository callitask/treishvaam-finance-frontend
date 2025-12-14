import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
    const { auth, loading } = useAuth();
    const location = useLocation();

    // Only block rendering for PROTECTED routes
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default PrivateRoute;