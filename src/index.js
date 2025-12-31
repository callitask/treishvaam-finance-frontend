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
// PHASE 3: ENTERPRISE RENDERING LOGIC (FIXED)
// =================================================================================
// We always use createRoot() because our architecture puts SEO content 
// into a sibling div (#server-content), leaving #root empty.
// hydrateRoot() on an empty container causes React Errors #418 & #423.
// =================================================================================

if (window.__PRELOADED_STATE__) {
  console.log('⚡ Adapting to Pre-loaded State (Zero-Latency Render)...');
}

// ALWAYS use createRoot (Client-Side Rendering logic)
// The "Hydration" feel comes from the data being pre-loaded, not the DOM being re-used.
ReactDOM.createRoot(container).render(appElement);