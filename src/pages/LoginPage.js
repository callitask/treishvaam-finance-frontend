import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const LoginPage = () => {
    const { login, auth, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Prevent circular redirect to /login
    let from = location.state?.from?.pathname || "/dashboard";
    if (from === "/login") from = "/dashboard";

    useEffect(() => {
        if (auth.isAuthenticated) {
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
                <LazyLoadImage alt="Logo" effect="blur" src="/logo.webp" className="h-24 w-auto mb-6" />
                <h1 className="text-4xl font-bold header-logo-text mb-4">Treishvaam Finance</h1>
                <p className="text-gray-600 mb-8 max-w-md">Secure Enterprise Login via Keycloak.</p>

                <button
                    onClick={login}
                    disabled={loading}
                    className={`py-3 px-8 rounded-lg text-white font-semibold shadow-lg transition duration-300 hover:scale-105 flex items-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'cta-button-primary'
                        }`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        "Sign In with SSO"
                    )}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;