/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - GDPR-Compliant Client-Side Biometric Telemetry (Phase 6.2).
 * - Feeds non-PII, continuous behavioral data to the AEGIS L5-BIE backend layer.
 *
 * Scope:
 * - Collects anonymized interaction velocities (mouse movements, key press intervals, scroll patterns).
 * - Hashes identifiers locally using Web Crypto API to ensure Zero-Knowledge tracking.
 * - MUST NEVER intercept exact keystroke values, form data, or user inputs.
 *
 * Critical Dependencies:
 * - Backend: `/api/v1/security/aegis/telemetry`
 *
 * Security Constraints:
 * - Never transmit raw IP addresses or strings.
 * - Enforce non-blocking async operations (`requestIdleCallback` or throttled promises).
 * - Environment agnostic (must run securely in Next.js CSR environment).
 *
 * Non-Negotiables:
 * - Data MUST be batched and transmitted periodically to protect Tomcat HTTP threads.
 *
 * Change Intent:
 * - Implement Phase 6.2 (Frontend Biometric Telemetry) to detect headless bots that successfully pass TLS/JA3 checks but lack human interaction signatures.
 *
 * Future AI Guidance:
 * - DO NOT modify the SHA-256 hashing logic. It is legally required for GDPR compliance.
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 * • Implemented AegisTelemetry class.
 * • Why it was added: Provides continuous validation of human intent post-authentication.
 * • Date: 2026-05-22
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted, truncated, rewritten, or regenerated.
 * Future AI must append only.
 */

export class AegisTelemetry {
    private static instance: AegisTelemetry;
    private eventBuffer: any[] = [];
    private lastEventTime: number = Date.now();
    private flushIntervalMs: number = 15000; // 15 seconds
    private isInitialized: boolean = false;
    private sessionHash: string = '';

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initSessionHash();
        }
    }

    public static getInstance(): AegisTelemetry {
        if (!AegisTelemetry.instance) {
            AegisTelemetry.instance = new AegisTelemetry();
        }
        return AegisTelemetry.instance;
    }

    private async initSessionHash() {
        try {
            // Generate a GDPR-compliant anonymous session footprint
            const ua = navigator.userAgent;
            const screen = `${window.screen.width}x${window.screen.height}`;
            const time = new Date().toDateString();

            const rawData = new TextEncoder().encode(`${ua}-${screen}-${time}`);
            const hashBuffer = await crypto.subtle.digest('SHA-256', rawData);

            this.sessionHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('')
                .substring(0, 16); // Short hash is sufficient for short-lived telemetry correlation
        } catch (e) {
            this.sessionHash = "fallback-anon-session";
        }
    }

    public initialize() {
        if (this.isInitialized || typeof window === 'undefined') return;

        // Throttled Event Listeners to prevent main-thread blocking
        window.addEventListener('mousemove', this.throttle((e: MouseEvent) => {
            this.recordEvent('mousemove', { speed: this.calculateSpeed(e) });
        }, 500), { passive: true });

        window.addEventListener('scroll', this.throttle(() => {
            this.recordEvent('scroll', { depth: window.scrollY });
        }, 1000), { passive: true });

        window.addEventListener('keydown', this.throttle(() => {
            // WE STRICTLY AVOID LOGGING e.key OR e.code FOR GDPR COMPLIANCE
            this.recordEvent('keydown', { type: 'anonymous_stroke' });
        }, 300), { passive: true });

        // Batch flushing
        setInterval(() => this.flush(), this.flushIntervalMs);
        this.isInitialized = true;
    }

    private throttle(func: Function, limit: number) {
        let inThrottle: boolean;
        return function (this: any, ...args: any[]) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    private calculateSpeed(e: MouseEvent): number {
        const now = Date.now();
        const timeDiff = now - this.lastEventTime;
        this.lastEventTime = now;
        return timeDiff > 0 ? 1 / timeDiff : 0; // Simple inverse time delta representation
    }

    private recordEvent(type: string, data: any) {
        if (this.eventBuffer.length > 50) return; // Hard cap memory footprint

        this.eventBuffer.push({
            t: type,
            ts: Date.now(),
            ...data
        });
    }

    private flush() {
        if (this.eventBuffer.length === 0) return;

        const payload = {
            session_id: this.sessionHash,
            events: [...this.eventBuffer]
        };

        this.eventBuffer = []; // Clear buffer immediately

        // Use sendBeacon for non-blocking telemetry dispatch, falling back to fetch
        const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/security/aegis/telemetry`;

        try {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(endpoint, JSON.stringify(payload));
            } else {
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => { });
            }
        } catch (e) {
            // Silently fail telemetry on ad-blockers to prevent console spam
        }
    }
}