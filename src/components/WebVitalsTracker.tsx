/**
 * AI-CONTEXT:
 * Purpose: Track Core Web Vitals (LCP, CLS, FID, TTFB, FCP) and report to our analytics pipeline.
 * Why: Google uses CWV for search ranking. We need to monitor regressions proactively.
 * Non-Negotiables:
 * - Must NOT block rendering. All reporting is async.
 * - Reports to postEvent() (first-party) NOT to GA4 (we want raw unprocessed values).
 * * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 6): Web Vitals tracking via web-vitals library.
 * - EDITED:
 * • Changed API from v3 (onCLS/onINP) to v2 (getCLS/getFID).
 * • Why: The project has web-vitals v2.1.4 installed. Using the v3 API caused a fatal TypeScript 
 * compilation error during the Next.js @cloudflare/next-on-pages build.
 * • What behavior must remain unchanged: Asynchronous loading to prevent main-thread blocking.
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
                        name: metric.name,        // e.g. "LCP", "CLS", "FID"
                        value: metric.value,      // The actual metric value
                        rating: metric.rating,    // "good" | "needs-improvement" | "poor"
                        delta: metric.delta,      // Change since last report
                        id: metric.id,            // Unique ID for this metric instance
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