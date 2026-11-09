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
 * - EDITED (Phase 9 GSC Googlebot Crawler Guard):
 *   • Added bot/crawler guard to `initFaro` and `postEvent` to prevent firing analytics beacons for Googlebot and automated crawlers.
 *   • Why: Eliminates Google Search Console "Googlebot blocked by robots.txt" errors on `/api/v1/analytics/event`.
 * - EDITED (Phase 13.1 - Offline Analytics Queue & Auto-Sync):
 *   • Added `localStorage` FIFO queue (`treishvaam_offline_analytics_v1`, max 100) for `202 queued_offline` and network failures, preserving original client `timestamp`/`url`/`path`.
 *   • Added `flushOfflineAnalyticsQueue()` on 3s page-load delay and `online` event; dequeues only on `200 OK`.
 *   • Why: First-party analytics auto-syncs when backend returns; GA4 continues always-on via Edge.
 */
import { initializeFaro } from '@grafana/faro-web-sdk';
import { API_URL } from './apiConfig';

export function initFaro() {
    if (typeof navigator !== 'undefined' && (/bot|crawl|spider|googlebot|inspectiontool|adsbot|bingbot|slurp/i.test(navigator.userAgent || '') || navigator.webdriver)) {
        return;
    }
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

// ------------------------------------------------------------------
// Phase 13.1: Enterprise Offline Analytics Queue (localStorage FIFO)
// ------------------------------------------------------------------
const OFFLINE_QUEUE_KEY = 'treishvaam_offline_analytics_v1';
const OFFLINE_QUEUE_MAX = 100;

function loadOfflineQueue() {
    try {
        if (typeof localStorage === 'undefined') return [];
        const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
}

function enqueueOfflineEvent(payload) {
    try {
        if (typeof localStorage === 'undefined') return;
        const queue = loadOfflineQueue();
        queue.push({ ...payload, _queuedAt: Date.now() });
        while (queue.length > OFFLINE_QUEUE_MAX) queue.shift();
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {}
}

export async function flushOfflineAnalyticsQueue() {
    try {
        if (typeof window === 'undefined') return;
        const queue = loadOfflineQueue();
        if (queue.length === 0) return;
        const remaining = [];
        for (const item of queue) {
            try {
                const { _queuedAt, ...payload } = item;
                const res = await fetch(`${API_URL}/api/v1/analytics/event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true,
                });
                if (res.status === 202 || !res.ok) remaining.push(item);
            } catch (e) { remaining.push(item); }
        }
        try {
            if (remaining.length === 0) localStorage.removeItem(OFFLINE_QUEUE_KEY);
            else localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
        } catch (e) {}
    } catch (e) {}
}

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => { flushOfflineAnalyticsQueue(); });
    setTimeout(() => { flushOfflineAnalyticsQueue(); }, 3000);
}

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
    if (typeof navigator !== 'undefined' && (/bot|crawl|spider|googlebot|inspectiontool|adsbot|bingbot|slurp/i.test(navigator.userAgent || '') || navigator.webdriver)) {
        return;
    }

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
            let beaconOk = false;
            try { beaconOk = navigator.sendBeacon(`${API_URL}/api/v1/analytics/event`, blob); } catch (e) {}
            if (!beaconOk) enqueueOfflineEvent(payload);
        } else {
            try {
                const res = await fetch(`${API_URL}/api/v1/analytics/event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                });
                if (res.status === 202) enqueueOfflineEvent(payload);
            } catch (e) { enqueueOfflineEvent(payload); }
        }
    } catch (error) {
        // Silent catch: Analytics failure must never disrupt UX — queue for later sync
        try { enqueueOfflineEvent(extraPayload); } catch (e) {}
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