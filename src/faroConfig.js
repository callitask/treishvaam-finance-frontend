/**
 * AI-CONTEXT:
 * Purpose: Frontend Telemetry and Analytics Pipeline.
 * Scope: 
 * - Originally configured for Grafana Faro (RUM & Error tracking).
 * - Now extended to handle First-Party Treishvaam Analytics (Scroll, Time, Exit Intent).
 * Security Constraints: 
 * - Relies on API Config to determine backend endpoint.
 * - Does NOT collect PII (IPs are handled at the Edge).
 * * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 6 Init): Basic Grafana Faro initialization for RUM.
 * - EDITED (Phase 5 - First-Party Analytics):
 * • Implemented `postEvent` to dispatch payloads to `/api/v1/analytics/event`.
 * • Implemented `initScrollTracking` for 25%, 50%, 75%, 90%, 100% read depth milestones.
 * • Implemented `initTimeTracking` leveraging `beforeunload` and `visibilitychange`.
 * • Implemented `initExitIntent` based on mouse leaving the viewport top boundary.
 * • Why: Achieve 100% data ownership of user engagement metrics independent of Google Analytics.
 */
import { initializeFaro } from '@grafana/faro-web-sdk';
import { API_URL } from './apiConfig';

export function initFaro() {
    // Only initialize in production to save bandwidth
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        initializeFaro({
            url: 'https://backend.treishvaamgroup.com/faro/collect', // Assuming a gateway routes this to Tempo/Loki
            app: {
                name: 'treishvaam-finance-frontend',
                version: '1.0.0',
                environment: 'production'
            },
        });
    }
}

/**
 * ---------------------------------------------------------
 * PHASE 5: FIRST-PARTY ANALYTICS BEACON SYSTEM
 * ---------------------------------------------------------
 */

// Generate a simple session ID valid for the current tab lifecycle
const SESSION_ID = typeof window !== 'undefined' ? crypto.randomUUID() : 'ssr-session';
const pageLoadTime = Date.now();

export const postEvent = async (eventType, extraPayload = {}) => {
    if (typeof window === 'undefined') return;

    try {
        const payload = {
            sessionId: SESSION_ID,
            eventType: eventType,
            url: window.location.href,
            path: window.location.pathname,
            referrer: document.referrer || '',
            deviceType: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : (navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'),
            os: navigator.platform || 'Unknown',
            userAgent: navigator.userAgent,
            ...extraPayload
        };

        // Use sendBeacon for non-blocking exit events, otherwise fetch
        if (eventType === 'exit_intent' || eventType === 'page_unload') {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(`${API_URL}/api/v1/analytics/event`, blob);
        } else {
            await fetch(`${API_URL}/api/v1/analytics/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                // Important: Do not keep connection alive, fire and forget
                keepalive: true
            });
        }
    } catch (error) {
        // Silent catch: Analytics failure must never disrupt UX
        console.warn('First-party analytics dispatch failed', error);
    }
};

// --- BEHAVIORAL TRACKING INITS ---

export const initScrollTracking = () => {
    if (typeof window === 'undefined') return;

    let milestones = { 25: false, 50: false, 75: false, 90: false, 100: false };

    const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const totalHeight = document.documentElement.scrollHeight;
        const depth = (scrollPosition / totalHeight) * 100;

        Object.keys(milestones).forEach(milestone => {
            if (depth >= Number(milestone) && !milestones[milestone]) {
                milestones[milestone] = true;
                postEvent('scroll_depth', { scrollDepth: Number(milestone) });
            }
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
};

export const initTimeTracking = () => {
    if (typeof window === 'undefined') return;

    const dispatchTime = (type) => {
        const timeOnPageMs = Date.now() - pageLoadTime;
        postEvent(type, { timeOnPageMs });
    };

    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') dispatchTime('visibility_hidden');
    });

    window.addEventListener('beforeunload', () => dispatchTime('page_unload'));
};

export const initExitIntent = () => {
    if (typeof window === 'undefined') return;

    const handleMouseLeave = (e) => {
        // If mouse leaves top of the window (moving towards address bar)
        if (e.clientY <= 0) {
            postEvent('exit_intent');
            // Remove listener so it only fires once per session
            document.removeEventListener('mouseleave', handleMouseLeave);
        }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
};

// Helper to fire standard page view
export const trackPageView = () => {
    postEvent('page_view');
};