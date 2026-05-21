/**
 * AI-CONTEXT:
 * Purpose: Track Core Web Vitals (LCP, CLS, INP, TTFB, FCP) and report to our analytics pipeline.
 * Why: Google uses CWV for search ranking. We need to monitor regressions proactively.
 * Non-Negotiables:
 * - Must NOT block rendering. All reporting is async.
 * - Reports to postEvent() (first-party) NOT to GA4 (we want raw unprocessed values).
 * IMMUTABLE CHANGE HISTORY:
 * - ADDED (Phase 6): Web Vitals tracking via web-vitals library.
 */
'use client';

import { useEffect } from 'react';

export default function WebVitalsTracker() {
    useEffect(() => {
        // Dynamically import to avoid SSR issues and keep it out of initial bundle
        import('web-vitals').then(({ onCLS, onINP, onLCP, onTTFB, onFCP }) => {
            const report = (metric: any) => {
                // Import postEvent dynamically to avoid circular dep
                import('../faroConfig').then(({ postEvent }) => {
                    postEvent('web_vital', {
                        name: metric.name,        // e.g. "LCP", "CLS", "INP"
                        value: metric.value,      // The actual metric value
                        rating: metric.rating,    // "good" | "needs-improvement" | "poor"
                        delta: metric.delta,      // Change since last report
                        id: metric.id,            // Unique ID for this metric instance
                    });
                });
            };

            onCLS(report);   // Cumulative Layout Shift
            onINP(report);   // Interaction to Next Paint (replaces FID)
            onLCP(report);   // Largest Contentful Paint
            onTTFB(report);  // Time to First Byte
            onFCP(report);   // First Contentful Paint
        });
    }, []);

    return null; // Renderless component
}