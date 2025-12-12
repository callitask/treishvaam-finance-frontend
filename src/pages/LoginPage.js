import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom'; // Import hooks

const LoginPage = () => {
    const { login, auth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Get the page they tried to visit, or default to dashboard
    const from = location.state?.from?.pathname || "/dashboard";

    useEffect(() => {
        if (auth.isAuthenticated) {
            // FIX: Use navigate() instead of window.location to prevent full reload
            // This preserves the AuthContext state.
            navigate(from, { replace: true });
        }
    }, [auth.isAuthenticated, navigate, from]);

    return (
        <div className="min-h-screen hero-silver-gradient flex items-center justify-center p-4">
            <Helmet>
                <title>Treishfin · Admin Login</title>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="container mx-auto flex items-center justify-center flex-col text-center">
                <LazyLoadImage alt="Logo" effect="blur" src="/logo.png" className="h-24 w-24 mb-6" />
                <h1 className="text-4xl font-bold header-logo-text mb-4">Treishvaam Finance</h1>
                <p className="text-gray-600 mb-8 max-w-md">Secure Enterprise Login via Keycloak.</p>

                <button
                    onClick={login}
                    className="py-3 px-8 rounded-lg text-white font-semibold cta-button-primary transition duration-300 shadow-lg hover:scale-105"
                >
                    Sign In with SSO
                </button>
            </div>
        </div>
    );
};

export default LoginPage;