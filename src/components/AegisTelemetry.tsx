/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Next.js Client Component wrapper for the AEGIS Biometric tracking script.
 *
 * Scope:
 * - Executes strictly in the browser.
 * - Safely initializes event listeners on component mount.
 *
 * Critical Dependencies:
 * - src/lib/aegis-biometrics.ts
 *
 * Security Constraints:
 * - Render silent. Must never disrupt DOM layout or CSS.
 *
 * Change Intent:
 * - Executing Phase 6.2 of the AEGIS Master Orchestrator.
 *
 * Future AI Guidance:
 * - Keep this component completely isolated. Do not merge it with visual components.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Initial creation for Phase 6.2 Frontend Telemetry.
 * • Wrapped native JS tracking in React useEffect lifecycle.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */
"use client";

import { useEffect } from 'react';
import { initializeAegisTelemetry } from '../lib/aegis-biometrics';

export default function AegisTelemetry() {
    useEffect(() => {
        let cleanup = () => { };

        if (typeof window !== 'undefined') {
            cleanup = initializeAegisTelemetry();
        }

        return () => {
            if (cleanup) cleanup();
        };
    }, []);

    return null; // Silent telemetry, no DOM footprint
}