import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

// Export the instance so AuthContext can access it
export let faro = null;

const resolveTrafficSource = () => {
    if (typeof window === 'undefined') return 'Unknown';

    // 1. Check if we already have a stored source for this session
    const storedSource = sessionStorage.getItem('traffic_source');
    if (storedSource) return storedSource;

    // 2. Analyze Referrer
    const referrer = document.referrer;
    let source = 'Direct';

    if (!referrer) {
        source = 'Direct';
    } else if (referrer.includes(window.location.hostname)) {
        source = 'Internal'; // Should generally be covered by storedSource, but fallback
    } else if (referrer.match(/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\./i)) {
        source = 'Organic Search';
    } else if (referrer.match(/facebook\.|instagram\.|linkedin\.|twitter\.|t\.co|pinterest\.|reddit\./i)) {
        source = 'Social Media';
    } else {
        source = 'Referral';
    }

    // 3. Persist for the duration of the tab session
    sessionStorage.setItem('traffic_source', source);
    return source;
};

const initFaro = () => {
    // Safe guard against non-browser environments
    if (typeof window === 'undefined') return;

    // Initialize in production OR if specifically testing on the live domain
    if (process.env.NODE_ENV === 'production' || window.location.hostname.includes('treishvaamgroup.com')) {
        try {
            const trafficSource = resolveTrafficSource();
            const persistentVisitorId = localStorage.getItem('visitor_id') || crypto.randomUUID();
            localStorage.setItem('visitor_id', persistentVisitorId);

            faro = initializeFaro({
                // TARGET: Safe Camouflaged Endpoint to bypass Ad-Blockers
                url: 'https://backend.treishvaamgroup.com/api/v1/monitoring/ingest',
                app: {
                    name: 'treishvaam-frontend',
                    version: '1.0.0',
                    environment: 'production'
                },
                // Inject Source & Visitor ID into every payload
                extra: {
                    trafficSource: trafficSource,
                    visitorId: persistentVisitorId
                },
                instrumentations: [
                    // Load mandatory instrumentations (Console, Errors, Web Vitals)
                    ...getWebInstrumentations(),
                    // Load tracing instrumentation for API correlations
                    new TracingInstrumentation(),
                ],
            });

            // Explicitly set the session source attribute for immediate tracking
            faro.api.pushEvent('session_start', {
                source: trafficSource,
                visitorId: persistentVisitorId
            });

            console.log(`[Faro] Real User Monitoring initialized. Source: ${trafficSource}`);
        } catch (e) {
            console.warn('[Faro] Failed to initialize:', e);
        }
    }
};

export default initFaro;