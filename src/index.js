import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { initFaro } from './faroConfig'; // --- ADDED ---

// Initialize Real User Monitoring (RUM)
initFaro();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        {/* Add HelmetProvider around your App */}
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);