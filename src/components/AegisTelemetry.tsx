"use client";

/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Client-side wrapper for the AEGIS L5-BIE biometric telemetry engine.
 * * Scope:
 * - Mounts the WebCrypto hashing listener strictly in the browser environment.
 * * Critical Dependencies:
 * - src/lib/aegis-biometrics.ts
 * * Security Constraints:
 * - Must be a "use client" component.
 * - Must unmount listeners gracefully to prevent memory leaks or dual-firing.
 * * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Created isolated client component to allow Next.js Edge SSR to render the global layout without failing on WebCrypto `window` references.
 */

import { useEffect } from 'react';
import { initializeAegisTelemetry } from '../lib/aegis-biometrics';

export default function AegisTelemetry() {
    useEffect(() => {
        // Initializes the passive DOM listeners for Jitter Entropy extraction
        const cleanup = initializeAegisTelemetry();

        return () => {
            // Guarantee teardown if the component unmounts
            if (cleanup) cleanup();
        };
    }, []);

    // Purely passive telemetry layer. Emits no UI.
    return null;
}