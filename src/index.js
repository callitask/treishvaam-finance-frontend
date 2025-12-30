import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import initFaro from './faroConfig'; // CHANGED: Default import

// Initialize Real User Monitoring (RUM)
initFaro();

const container = document.getElementById('root');

// Define the App Structure once to ensure consistency
const appElement = (
  <Router>
    <AuthProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </AuthProvider>
  </Router>
);

// =================================================================================
// PHASE 3: ENTERPRISE HYDRATION LOGIC
// =================================================================================
// 1. Check if the Worker/Backend injected Preloaded State (SEO Mode)
// 2. If Yes: Use hydrateRoot() to attach to existing HTML (Zero flicker, 100% SEO)
// 3. If No: Use createRoot() to render from scratch (Standard SPA behavior)
// =================================================================================

if (window.__PRELOADED_STATE__) {
  // SEO MODE: The HTML is already present. Hydrate it.
  // This prevents React from wiping the content Googlebot just saw.
  console.log('💧 Hydrating Pre-rendered Content...');
  ReactDOM.hydrateRoot(container, appElement);
} else {
  // CLIENT MODE: The container is empty. Render it.
  ReactDOM.createRoot(container).render(appElement);
}