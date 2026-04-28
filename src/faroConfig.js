/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Initialize Grafana Faro RUM (Real User Monitoring) on the frontend.
 *
 * Scope:
 * - Responsible for capturing browser metadata, screen resolution, referral sources, and routing the payload to the backend ingress.
 *
 * Critical Dependencies:
 * - Backend: MonitoringController (/api/v1/monitoring/ingest)
 * - Frontend: App layout/initialization.
 *
 * Security Constraints:
 * - Must not leak PII in URL parameters to the telemetry system without sanitization.
 *
 * Non-Negotiables:
 * - Must use relative URLs for the ingest endpoint to go through the Cloudflare Worker proxy.
 *
 * Change Intent:
 * - Enhance Faro payload with explicit screen resolution, raw userAgent, and smarter traffic source resolution (UTM + Referrer).
 *
 * Future AI Guidance:
 * - Do not remove the sessionStorage persistence for traffic_source, it prevents single-session source dilution.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED:
 * • Added UTM parameter parsing to resolveTrafficSource.
 * • Injected resolution, userAgent, urlQuery, and referrer into Faro initialization 'extra' map.
 * • Reason: Backend requires accurate raw data to parse Device/OS and resolution correctly.
 */
import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Export the instance so AuthContext can access it
export let faro = null;

const resolveTrafficSource = () => {
    if (typeof window === 'undefined') return 'Unknown';

    // 1. Check if we already have a stored source for this session
    const storedSource = sessionStorage.getItem('traffic_source');
    if (storedSource) return storedSource;

    // 2. Check UTM parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');

    if (utmSource) {
        const source = utmMedium ? `${utmSource} / ${utmMedium}` : utmSource;
        sessionStorage.setItem('traffic_source', source);
        return source;
    }

    // 3. Analyze Referrer
    const referrer = document.referrer;
    let source = 'Direct';

    if (!referrer) {
        source = 'Direct';
    } else if (referrer.includes(window.location.hostname)) {
        source = 'Internal';
    } else if (referrer.match(/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\./i)) {
        source = 'Organic Search';
    } else if (referrer.match(/facebook\.|instagram\.|linkedin\.|twitter\.|t\.co|pinterest\.|reddit\./i)) {
        source = 'Social Media';
    } else {
        try {
            const refUrl = new URL(referrer);
            source = `Referral (${refUrl.hostname})`;
        } catch (e) {
            source = 'Referral';
        }
    }

    // 4. Persist for the duration of the tab session
    sessionStorage.setItem('traffic_source', source);
    return source;
};

const initFaro = () => {
    // Safe guard against non-browser environments
    if (typeof window === 'undefined') return;

    // Initialize in production OR if specifically testing on the live domain
    if (process.env.NODE_ENV === 'production' || window.location.hostname.includes('treishvaamgroup.com') || window.location.hostname.includes('treishvaamfinance.com')) {
        try {
            const trafficSource = resolveTrafficSource();
            const persistentVisitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
            localStorage.setItem('visitor_id', persistentVisitorId);

            // FIX: Use RELATIVE path so request hits the Cloudflare Worker on the main domain
            // The Worker will inject headers and proxy this to the backend.
            const ingestUrl = window.location.origin + '/api/v1/monitoring/ingest';

            const resolution = `${window.screen.width}x${window.screen.height}`;
            const userAgent = navigator.userAgent;
            const urlQuery = window.location.search;
            const referrer = document.referrer;

            faro = initializeFaro({
                url: ingestUrl,
                app: {
                    name: 'treishvaam-frontend',
                    version: '1.0.0',
                    environment: 'production'
                },
                extra: {
                    trafficSource: trafficSource,
                    visitorId: persistentVisitorId,
                    resolution: resolution,
                    userAgent: userAgent,
                    urlQuery: urlQuery,
                    referrer: referrer
                },
                instrumentations: [
                    ...getWebInstrumentations(),
                    new TracingInstrumentation(),
                ],
            });

            faro.api.pushEvent('session_start', {
                source: trafficSource,
                visitorId: persistentVisitorId,
                resolution: resolution
            });

            console.log(`[Faro] RUM initialized via Worker Proxy. Source: ${trafficSource}`);
        } catch (e) {
            console.warn('[Faro] Failed to initialize:', e);
        }
    }
};

export default initFaro;