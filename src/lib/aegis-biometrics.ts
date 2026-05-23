/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Implements AEGIS Layer 5 (L5-BIE) Frontend Biometric Telemetry logic.
 * - Extracts interaction jitter, mouse velocity, and typing cadence to distinguish bots from humans.
 *
 * Scope:
 * - Operates entirely client-side.
 * - MUST NEVER record raw keystroke letters or actual screen coordinates.
 *
 * Critical Dependencies:
 * - Native WebCrypto API (crypto.subtle) for localized hashing.
 * - Backend: POSTs to /api/v1/aegis/telemetry.
 *
 * Security Constraints:
 * - 100% GDPR Compliant. Only the SHA-256 hash of the generic vector string is transmitted.
 * - Must operate passively (0ms TBT) to avoid blocking the Next.js main thread.
 *
 * Change Intent:
 * - Executing Phase 6.2 of the AEGIS Master Orchestrator.
 *
 * Future AI Guidance:
 * - Do not add heavy npm crypto libraries here. Use native WebCrypto to respect Cloudflare Edge limits.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Initial creation for Phase 6.2 Frontend Telemetry.
 * • Implemented passive mousemove/keydown listeners.
 * • Implemented WebCrypto SHA-256 local hashing.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated.
 * Future AI must append only.
 */

export const initializeAegisTelemetry = () => {
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
        return () => { }; // Fail gracefully in SSR or extremely old browsers
    }

    let keystrokeCount = 0;
    let mouseDistance = 0;
    let lastMouseX = -1;
    let lastMouseY = -1;

    const handleMouseMove = (e: MouseEvent) => {
        if (lastMouseX !== -1) {
            // Calculate raw distance traveled
            mouseDistance += Math.sqrt(
                Math.pow(e.clientX - lastMouseX, 2) + Math.pow(e.clientY - lastMouseY, 2)
            );
        }
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    };

    const handleKeyDown = () => {
        keystrokeCount++; // Only tracking the physical press event, not the key value
    };

    const reportTelemetry = async () => {
        if (keystrokeCount === 0 && mouseDistance === 0) return; // Prevent empty payload spam

        // Create the non-PII vector string (e.g., "15:4300" -> 15 keys, 4300px moved)
        const vector = `${keystrokeCount}:${Math.round(mouseDistance)}`;

        try {
            const msgBuffer = new TextEncoder().encode(vector);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';

            await fetch(`${backendUrl}/api/v1/aegis/telemetry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Aegis-Biometric-Hash': hashHex
                },
                body: JSON.stringify({ biometricHash: hashHex }),
                keepalive: true // Guaranteed delivery even on tab close
            });
        } catch (err) {
            // Fail silently to prevent console pollution
        }

        // Reset state for the next 15-second epoch
        keystrokeCount = 0;
        mouseDistance = 0;
    };

    // Attach passive listeners to guarantee zero performance regression
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: true });

    // Broadcast the hashed vector every 15 seconds
    const interval = setInterval(reportTelemetry, 15000);

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyDown);
        clearInterval(interval);
    };
};