import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [usernameExists, setUsernameExists] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const auth = useAuth();

    /*useEffect(() => {
        if (!isLoginView && regUsername.includes('@') && regUsername.includes('.')) {
            const timer = setTimeout(() => {
                fetch('https://treishfin.udaybhai.com/api/auth/check-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: regUsername }),
                })
                .then(res => res.json())
                .then(data => setUsernameExists(data.exists))
                .catch(() => setStatusMessage('Could not verify email.'));
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setUsernameExists(null);
        }
    }, [regUsername, isLoginView]);*/

    const checkUsername = async () => {
        if (regUsername.includes('@') && regUsername.includes('.')) {
            try {
                const response = await fetch('https://treishfin.udaybhai.com/api/auth/check-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: regUsername }),
                });
                const data = await response.json();
                setUsernameExists(data.exists);
            } catch (error) {
                setStatusMessage('Could not verify email.');
            }
        } else {
            setUsernameExists(null);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (usernameExists) {
            setStatusMessage('This email is already registered.');
            return;
        }
        setIsLoading(true);
        setStatusMessage('');
        const user = { name: regName, username: regUsername, password: regPassword };
        try {
            const response = await fetch('https://treishfin.udaybhai.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage('Registration successful! Please sign in.');
                //setIsLoginView(true); // Switch to login view
                // You might want to clear the form here too
                setRegName('');
                setRegUsername('');
                setRegPassword('');
            } else {
                setStatusMessage(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            setStatusMessage('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage('');
        try {
            const response = await fetch('https://treishfin.udaybhai.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginUsername, password: loginPassword })
            });
            const data = await response.json();

            if (response.ok) {
                auth.login(data.token);
                navigate('/dashboard');
            } else {
                setStatusMessage(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            setStatusMessage('An error occurred during login. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-silver-gradient flex items-center justify-center p-4">
            <div className="container mx-auto flex items-center justify-center lg:justify-between">
                <div className="hidden lg:flex flex-col items-start justify-center basis-1/2 pr-16">
                    <LazyLoadImage alt="logo" effect="blur" src="/logo.png" className="h-16 w-16 mr-4" />
                    <h1 className="text-4xl md:text-5xl font-bold header-logo-text">Treishvaam Finance</h1>
                    <p className="text-lg md:text-xl text-gray-700 mt-4">Empowering your financial journey.</p>
                </div>
                <div className="basis-full lg:basis-1/2 max-w-md w-full">
                    <div className="bg-white p-10 rounded-lg shadow-xl">
                        {isLoginView ? (
                            <div>
                                <h2 className="text-center text-3xl font-bold section-title">Sign in to your account</h2>
                                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                                    <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} name="email" type="email" required className="auth-input" placeholder="Email address" />
                                    <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} name="password" type="password" required className="auth-input" placeholder="Password" />
                                    <button type="submit" disabled={isLoading} className="w-full py-3 px-4 rounded-lg text-white font-semibold cta-button-primary transition duration-300 disabled:opacity-50">
                                        {isLoading && isLoginView ? 'Signing in...' : 'Sign in'}
                                    </button>
                                </form>
                                <div className="mt-6 text-center text-sm text-gray-600">
                                    Not a member? <button onClick={() => { setIsLoginView(false); setStatusMessage(''); }} className="font-medium text-sky-600 hover:text-sky-500">Register now</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-center text-3xl font-bold section-title">Create a new account</h2>
                                <form onSubmit={handleRegister} className="mt-8 space-y-6">
                                    <input value={regName} onChange={(e) => setRegName(e.target.value)} name="name" type="text" required className="auth-input" placeholder="Full Name" />
                                    <div className="relative">
                                        <input
                                            value={regUsername}
                                            onChange={(e) => setRegUsername(e.target.value)}
                                            name="email"
                                            type="email"
                                            required
                                            className={`auth-input pr-10 ${
                                                usernameExists === true
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                                    : usernameExists === false
                                                    ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                                                    : 'border-gray-300'
                                            }`}
                                            placeholder="Email address"
                                            autoComplete="off"
                                            style={{
                                                boxShadow:
                                                    usernameExists === true
                                                        ? '0 0 0 2px #f87171'
                                                        : usernameExists === false
                                                        ? '0 0 0 2px #4ade80'
                                                        : undefined,
                                                transition: 'box-shadow 0.2s',
                                            }}
                                        />
                                        {/* Icon for error or success */}
                                        {usernameExists === true && (
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                                                {/* Red X icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </span>
                                        )}
                                        {usernameExists === false && (
                                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                                                {/* Green check icon */}
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </span>
                                        )}
                                    </div>
                                    {usernameExists === true && (
                                        <p className="text-red-500 text-xs mt-1 font-semibold">Email already taken.</p>
                                    )}
                                    {usernameExists === false && (
                                        <p className="text-green-500 text-xs mt-1 font-semibold flex items-center gap-1">Email is available!</p>
                                    )}
                                    <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} name="password" type="password" required className="auth-input" placeholder="Password" />
                                    <button type="submit" disabled={isLoading || usernameExists === true} className="w-full py-3 px-4 rounded-lg text-white font-semibold cta-button-primary transition duration-300 disabled:opacity-50">
                                        {isLoading && !isLoginView ? 'Registering...' : 'Register'}
                                    </button>
                                </form>
                                <div className="mt-6 text-center text-sm text-gray-600">
                                    Already have an account? <button onClick={() => { setIsLoginView(true); setStatusMessage(''); }} className="font-medium text-sky-600 hover:text-sky-500">Sign in</button>
                                </div>
                            </div>
                        )}
                        {statusMessage && <p className="mt-4 text-center font-semibold">{statusMessage}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
