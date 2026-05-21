/**
 * AI-CONTEXT:
 * Purpose: Track Core Web Vitals (LCP, CLS, FID, TTFB, FCP) and report to our analytics pipeline.
 * Why: Google uses CWV for search ranking. We need to monitor regressions proactively.
 * Non-Negotiables:
 * - Must NOT block rendering. All reporting is async.
 * - Reports to postEvent() (first-party) NOT to GA4 (we want raw unprocessed values).
 * * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 6): Web Vitals tracking via web-vitals library.
 * - EDITED: Changed API from v3 (onCLS/onINP) to v2 (getCLS/getFID) to fix TS compilation error.
 * - EDITED (Phase 6 Fix):
 * • Renamed payload properties (e.g., `id` -> `metricId`, `name` -> `metricName`).
 * • Why: Prevented namespace pollution and a fatal 500 Internal Server Error caused by sending an `id` string that collided with the backend's `Long` primary key.
 */
'use client';

import { useEffect } from 'react';

export default function WebVitalsTracker() {
    useEffect(() => {
        // Dynamically import to avoid SSR issues and keep it out of initial bundle
        import('web-vitals').then(({ getCLS, getFID, getLCP, getTTFB, getFCP }) => {
            const report = (metric: any) => {
                // Import postEvent dynamically to avoid circular dep
                import('../faroConfig').then(({ postEvent }) => {
                    postEvent('web_vital', {
                        metricName: metric.name,        // e.g. "LCP", "CLS", "FID"
                        metricValue: metric.value,      // The actual metric value
                        metricRating: metric.rating,    // "good" | "needs-improvement" | "poor"
                        metricDelta: metric.delta,      // Change since last report
                        metricId: metric.id,            // Renamed from 'id' to prevent Database PK collision
                    });
                });
            };

            if (getCLS) getCLS(report);   // Cumulative Layout Shift
            if (getFID) getFID(report);   // First Input Delay (v2 equivalent of INP)
            if (getLCP) getLCP(report);   // Largest Contentful Paint
            if (getTTFB) getTTFB(report); // Time to First Byte
            if (getFCP) getFCP(report);   // First Contentful Paint
        });
    }, []);

    return null; // Renderless component
}