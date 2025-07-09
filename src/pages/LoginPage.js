// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-silver-gradient flex items-center justify-center p-4">
            <div className="container mx-auto flex items-center justify-center lg:justify-between">
                
                <div className="hidden lg:flex flex-col items-start justify-center basis-1/2 pr-16">
                    <LazyLoadImage alt="Logo" effect="blur" src="/logo.png" className="h-16 w-16 mr-4" />
                    <h1 className="text-4xl md:text-5xl font-bold header-logo-text">Treishvaam Finance</h1>
                    <p className="text-lg md:text-xl text-gray-700 mt-4">Empowering your financial journey.</p>
                </div>

                <div className="basis-full lg:basis-1/2 max-w-md w-full">
                    <div className="bg-white p-10 rounded-lg shadow-xl">
                        <h2 className="text-center text-3xl font-bold section-title">Admin Sign In</h2>
                        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                            <input 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                name="email" // Added name attribute
                                type="email" 
                                required 
                                className="auth-input" 
                                placeholder="Email address" 
                                autoComplete="email" // Added autocomplete attribute
                            />
                            <input 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                name="current-password" // Added name attribute
                                type="password" 
                                required 
                                className="auth-input" 
                                placeholder="Password" 
                                autoComplete="current-password" // Added autocomplete attribute
                            />
                            {error && <p className="text-center text-sm text-red-600">{error}</p>}
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full py-3 px-4 rounded-lg text-white font-semibold cta-button-primary transition duration-300 disabled:opacity-50"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
