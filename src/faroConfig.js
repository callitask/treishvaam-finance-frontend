import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const initFaro = () => {
    // Safe guard against non-browser environments
    if (typeof window === 'undefined') return;

    // Initialize in production OR if specifically testing on the live domain
    if (process.env.NODE_ENV === 'production' || window.location.hostname.includes('treishvaamgroup.com')) {
        try {
            initializeFaro({
                // TARGET: Points to our Spring Boot Proxy (avoids CORS/Mixed Content)
                url: 'https://backend.treishvaamgroup.com/faro-collector/collect',
                app: {
                    name: 'treishvaam-frontend',
                    version: '1.0.0',
                    environment: 'production'
                },
                instrumentations: [
                    // Load mandatory instrumentations (Console, Errors, Web Vitals)
                    ...getWebInstrumentations(),
                    // Load tracing instrumentation for API correlations
                    new TracingInstrumentation(),
                ],
            });
            console.log('[Faro] Real User Monitoring initialized via Proxy');
        } catch (e) {
            console.warn('[Faro] Failed to initialize:', e);
        }
    }
};

export default initFaro;