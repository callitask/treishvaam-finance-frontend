import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';

const initFaro = () => {
    // Safe guard against non-browser environments
    if (typeof window === 'undefined') return;

    // Only initialize in production or if explicitly enabled
    if (process.env.NODE_ENV === 'production' || window.location.hostname.includes('treishvaamgroup.com')) {
        try {
            initializeFaro({
                url: 'https://backend.treishvaamgroup.com/faro-collector/collect',
                app: {
                    name: 'treishvaam-frontend',
                    version: '1.0.0',
                    environment: 'production'
                },
                instrumentations: [
                    ...getWebInstrumentations(),
                    new TracingInstrumentation(),
                ],
            });
            console.log('[Faro] Real User Monitoring initialized');
        } catch (e) {
            console.warn('[Faro] Failed to initialize:', e);
        }
    }
};

export default initFaro;