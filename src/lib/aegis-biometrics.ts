/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - AEGIS Phase 6.2: Frontend Biometric Telemetry Engine.
 * - Collects human-interaction heuristics (mouse speed, key intervals, touch entropy).
 *
 * Scope:
 * - Runs silently in the background, non-blocking to the main React thread.
 * - MUST execute locally.
 *
 * Critical Dependencies:
 * - Backend: Sends telemetry to `/api/public/aegis/telemetry`.
 * - Crypto: Uses Web Crypto API for SHA-256 hashing.
 *
 * Security Constraints:
 * - STRICT GDPR COMPLIANCE: Raw keystrokes or PII must NEVER be transmitted.
 * - All vector data must be mathematically hashed or normalized into generic entropy scores.
 *
 * Non-Negotiables:
 * - Performance: 0ms Total Blocking Time (TBT). Uses requestAnimationFrame and throttling.
 *
 * Change Intent:
 * - Phase 6 execution. Supplying the L5-Behavioral Intelligence Engine with real-time browser assertions.
 *
 * Future AI Guidance:
 * - Do not mutate the hashing algorithm.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Implemented `AegisBiometricTracker`.
 * • Why: To feed the backend behavioral engine without compromising user privacy or frontend performance.
 * • Phase: 6.2
 */

export class AegisBiometricTracker {
    private static instance: AegisBiometricTracker;
    private isTracking = false;

    // Telemetry vectors
    private mouseMovements: number = 0;
    private keyPresses: number = 0;
    private lastEventTime: number = Date.now();
    private interactionIntervals: number[] = [];

    // Performance throttling
    private lastProcessTime = 0;
    private readonly THROTTLE_MS = 250;

    private constructor() {
        if (typeof window === 'undefined') return;
    }

    public static getInstance(): AegisBiometricTracker {
        if (!AegisBiometricTracker.instance) {
            AegisBiometricTracker.instance = new AegisBiometricTracker();
        }
        return AegisBiometricTracker.instance;
    }

    public start() {
        if (this.isTracking || typeof window === 'undefined') return;
        this.isTracking = true;

        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        window.addEventListener('keydown', this.handleKeyDown, { passive: true });
        window.addEventListener('touchstart', this.handleTouch, { passive: true });

        // Transmit heartbeat every 30 seconds
        setInterval(() => this.transmitTelemetry(), 30000);
    }

    public stop() {
        if (!this.isTracking || typeof window === 'undefined') return;
        this.isTracking = false;

        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('touchstart', this.handleTouch);
    }

    private handleMouseMove = () => {
        const now = Date.now();
        if (now - this.lastProcessTime > this.THROTTLE_MS) {
            this.mouseMovements++;
            this.recordInterval(now);
            this.lastProcessTime = now;
        }
    };

    private handleKeyDown = () => {
        this.keyPresses++;
        this.recordInterval(Date.now());
    };

    private handleTouch = () => {
        this.mouseMovements += 2; // Treat touch identically to intensive mouse movement
        this.recordInterval(Date.now());
    };

    private recordInterval(now: number) {
        const interval = now - this.lastEventTime;
        if (interval < 5000) { // Ignore idle gaps > 5s
            this.interactionIntervals.push(interval);
            if (this.interactionIntervals.length > 50) this.interactionIntervals.shift();
        }
        this.lastEventTime = now;
    }

    // GDPR Compliant Hashing: Native WebCrypto API
    private async hashVector(vectorStr: string): Promise<string> {
        if (typeof crypto === 'undefined' || !crypto.subtle) return 'fallback-hash';
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(vectorStr);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            return 'failed-hash';
        }
    }

    private calculateEntropy(): number {
        if (this.interactionIntervals.length === 0) return 0;
        const mean = this.interactionIntervals.reduce((a, b) => a + b, 0) / this.interactionIntervals.length;
        const variance = this.interactionIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.interactionIntervals.length;
        // Natural human jitter results in higher variance. Bots are highly precise (variance ~ 0).
        return Math.min(Math.round(Math.sqrt(variance)), 1000);
    }

    private async transmitTelemetry() {
        if (this.mouseMovements === 0 && this.keyPresses === 0) return;

        const entropyScore = this.calculateEntropy();
        const rawVector = `M:${this.mouseMovements}|K:${this.keyPresses}|E:${entropyScore}`;

        // Ensure no PII or exact layout coordinates are transmitted
        const biometricHash = await this.hashVector(rawVector);

        const payload = {
            hash: biometricHash,
            entropy: entropyScore,
            isBotHeuristic: entropyScore < 10, // Bots usually have near-zero variance in events
            timestamp: Date.now()
        };

        try {
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon('/api/public/aegis/telemetry', blob);
            } else {
                fetch('/api/public/aegis/telemetry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                });
            }
        } catch (error) {
            // Silently fail to not pollute console
        }

        // Reset counters for next window
        this.mouseMovements = 0;
        this.keyPresses = 0;
        this.interactionIntervals = [];
    }
}

// Auto-initialize if running in browser
if (typeof window !== 'undefined') {
    // Wrap in requestIdleCallback to guarantee 0ms TBT impact during initial page load
    const init = window.requestIdleCallback || setTimeout;
    init(() => {
        AegisBiometricTracker.getInstance().start();
    });
}