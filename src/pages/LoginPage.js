import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';

// Array of texts for the rotating animation
const rotatingTexts = [
    "Empowering your financial journey.",
    "Expert-led content for smart learning.",
    "Secure your future by building knowledge.",
    "Innovating fintech education for a better tomorrow.",
    "Your partner in financial literacy."
];

const LoginPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [usernameExists, setUsernameExists] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();

    // State for the rotating text animation
    const [currentText, setCurrentText] = useState(rotatingTexts[0]);
    const [isFading, setIsFading] = useState(false);

    // Effect for checking username existence
    useEffect(() => {
        if (!isLoginView && regUsername.includes('@') && regUsername.includes('.')) {
            const timer = setTimeout(() => {
                fetch('My-finance-app-env.eba-uim2wfxt.ap-south-1.elasticbeanstalk.com/api/auth/check-username', {
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
    }, [regUsername, isLoginView]);

    // Effect to handle the rotating text animation
    useEffect(() => {
        let textIndex = 0;
        const intervalId = setInterval(() => {
            setIsFading(true); // Trigger fade-out
            setTimeout(() => {
                textIndex = (textIndex + 1) % rotatingTexts.length;
                setCurrentText(rotatingTexts[textIndex]);
                setIsFading(false); // Trigger fade-in
            }, 300); // This timeout should match the CSS transition duration
        }, 4000); // Time each text is visible

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log('Register button clicked!'); // Debugging log
        setStatusMessage('Registering...');

        if (usernameExists) {
            setStatusMessage('This email is already registered.');
            return;
        }

        const user = { name: regName, username: regUsername, password: regPassword };

        try {
            const response = await fetch('My-finance-app-env.eba-uim2wfxt.ap-south-1.elasticbeanstalk.com/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                setStatusMessage('Registration successful! Please log in.');
                setIsLoginView(true); // Switch to login view after successful registration
            } else {
                const errorData = await response.text();
                setStatusMessage(`Registration failed: ${errorData}`);
            }
        } catch (error) {
            console.error('Error during registration:', error); // Detailed error log
            setStatusMessage('Error during registration. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        console.log('1. handleLogin function started.'); // <-- Debugging log
        e.preventDefault(); // Prevents default form submission behavior
        console.log('2. Default prevented, setting status message.'); // <-- Debugging log
        setStatusMessage('Logging in...');

        try {
            console.log('3. Attempting fetch request to login API.'); // <-- Debugging log
            const response = await fetch('My-finance-app-env.eba-uim2wfxt.ap-south-1.elasticbeanstalk.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loginUsername, password: loginPassword })
            });

            console.log('4. Fetch request completed. Response status:', response.status); // <-- Debugging log

            if (response.ok) { // Check if the response status is 2xx
                const data = await response.json();
                console.log('5. Login successful, token received:', data.token); // <-- Debugging log
                auth.login(data.token); // Store the token using AuthContext
                navigate('/dashboard'); // Redirect to dashboard
                console.log('6. Navigated to /dashboard.'); // <-- Debugging log
            } else {
                const errorData = await response.text();
                console.error('7. Server responded with login error. Status:', response.status, 'Error Data:', errorData); // <-- Debugging log
                setStatusMessage('Invalid username or password.');
            }
        } catch (error) {
            console.error('8. Network or unexpected error during login fetch:', error); // <-- Debugging log
            setStatusMessage('Login failed. Please check the server.');
        }
    };

    const validationClass = usernameExists === true ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : usernameExists === false ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : 'border-gray-300';

    return (
        <div className="min-h-screen hero-silver-gradient flex items-center justify-center p-4">
            <div className="container mx-auto flex items-center justify-center lg:justify-between">

                {/* Left Panel: Logo and Rotating Text */}
                <div className="hidden lg:flex flex-col items-start justify-center basis-1/2 pr-16">
                    <div className="flex items-center mb-4">
                        <LazyLoadImage alt="logo" effect="blur" src="/logo.png" className="h-16 w-16 mr-4" />
                        <h1 className="text-4xl md:text-5xl font-bold header-logo-text">Treishvaam Finance</h1>
                    </div>
                    <p
                        className={`text-lg md:text-xl text-gray-700 mt-4 transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
                        style={{ minHeight: '2.5rem' }} // Prevents layout shift during text change
                    >
                        {currentText}
                    </p>
                </div>

                {/* Right Panel: Login/Register Form */}
                <div className="basis-full lg:basis-1/2 max-w-md w-full">
                    <div className="bg-white p-10 rounded-xl shadow-xl">
                        {isLoginView ? (
                            <div>
                                <h2 className="text-center text-3xl font-bold section-title">Sign in to your account</h2>
                                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                                    <input value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} name="email" type="email" required className="auth-input" placeholder="Email address" />
                                    <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} name="password" type="password" required className="auth-input" placeholder="Password" />
                                    <button type="submit" className="w-full py-3 px-4 rounded-lg text-white font-semibold cta-button-primary transition duration-300">Sign in</button>
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
                                    <div>
                                        <input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} name="email" type="email" required className={`auth-input ${validationClass}`} placeholder="Email address" />
                                        {usernameExists === true && <p className="text-red-500 text-xs mt-1">Email already exists.</p>}
                                        {usernameExists === false && <p className="text-green-500 text-xs mt-1">Email is available!</p>}
                                    </div>
                                    <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} name="password" type="password" required className="auth-input" placeholder="Password" />
                                    <button type="submit" className="w-full py-3 px-4 rounded-lg text-white font-semibold cta-button-primary transition duration-300">Register</button>
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