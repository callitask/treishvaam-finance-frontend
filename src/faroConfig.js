/**
 * AI-CONTEXT:
 * Purpose: Frontend Telemetry and Analytics Pipeline.
 * Scope: 
 * - Originally configured for Grafana Faro (RUM & Error tracking).
 * - Now extended to handle First-Party Treishvaam Analytics (Scroll, Time, Exit Intent).
 * Security Constraints: 
 * - Relies on API Config / Environment variables to determine backend endpoints.
 * - Does NOT collect PII (IPs are handled at the Edge).
 * 
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 6 Init): Basic Grafana Faro initialization for RUM.
 * - EDITED (Phase 5 - First-Party Analytics):
 *   • Implemented `postEvent` to dispatch payloads to `/api/v1/analytics/event`.
 *   • Implemented `initScrollTracking` for 25%, 50%, 75%, 90%, 100% read depth milestones.
 *   • Implemented `initTimeTracking` leveraging `beforeunload` and `visibilitychange`.
 *   • Implemented `initExitIntent` based on mouse leaving the viewport top boundary.
 *   • Why: Achieve 100% data ownership of user engagement metrics independent of Google Analytics.
 * - EDITED (Incident 72 - High Entropy Client Hints):
 *   • Added `extractHighEntropyPlatform()` to asynchronously request `platformVersion` from the User-Agent Client Hints API.
 *   • Appended the `platformVersion` to `extraPayload` in `postEvent`.
 *   • Why: Microsoft froze the standard UA string at Windows 10.0. The Client Hints API is the only $0.00 way to extract exact Windows 11 telemetry natively from modern Chromium browsers.
 * - EDITED (Phase 7 - P0 Transport & Fidelity Fix):
 *   • Added `screenResolution` to the outbound JSON payload for high-fidelity hardware tracking.
 *   • Extended `sendBeacon` execution block to include `visibility_hidden` events, neutralizing HTTP 499 client abort drops from `fetch({ keepalive: true })`.
 * - EDITED (Zero-Trust Decoupling & Config Hardening):
 *   • Decoupled Grafana Faro collector URL to consume `NEXT_PUBLIC_FARO_URL` with resilient production fallback.
 *   • Added safe environment validation ensuring zero crashes if environment variables are unset.
 * - EDITED (Regression Fix — Exit Intent Event Type):
 *   • Reverted accidental 'mouseenter' registration back to 'mouseleave'; the mismatch broke exit-intent detection and defeated the once-per-session removal guard.
 */
import { initializeFaro } from '@grafana/faro-web-sdk';
import { API_URL } from './apiConfig';

export function initFaro() {
    // Only initialize in production and on the client to save bandwidth and prevent Edge SSR crashes
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        const faroEndpoint = process.env.NEXT_PUBLIC_FARO_URL || 'https://backend.treishvaamgroup.com/faro/collect';

        initializeFaro({
            url: faroEndpoint,
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

// Asynchronous helper to fetch High-Entropy Client Hints without blocking render
const extractHighEntropyPlatform = async () => {
    if (typeof navigator !== 'undefined' && navigator.userAgentData && typeof navigator.userAgentData.getHighEntropyValues === 'function') {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(["platformVersion"]);
            return hints.platformVersion || 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    }
    return 'Unknown';
};

export const postEvent = async (eventType, extraPayload = {}) => {
    if (typeof window === 'undefined') return;

    try {
        const platformVersion = await extractHighEntropyPlatform();

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
            screenResolution: window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown',
            extra: {
                platformVersion: platformVersion, // Sends the extracted Client Hint explicitly
            },
            ...extraPayload
        };

        // Use sendBeacon for all non-blocking exit contexts to prevent HTTP 499 client aborts
        if (eventType === 'exit_intent' || eventType === 'page_unload' || eventType === 'visibility_hidden') {
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