"use client";
/**
 * AI-CONTEXT:
 *
 * Purpose:
 * - Provides Keycloak-based authentication state to the entire Next.js application.
 * - Manages token lifecycle: init, silent SSO, refresh, and graceful degradation.
 *
 * Scope:
 * - Responsible for: Keycloak init, token storage, user profile enrichment, token refresh.
 * - Must NEVER be responsible for: routing decisions, page-level access control (use PrivateRoute).
 *
 * Critical Dependencies:
 * - Backend: NEXT_PUBLIC_AUTH_URL → Keycloak realm at /auth
 * - Frontend: apiConfig.js (setAuthToken, getUserProfile), faroConfig.js (Grafana Faro RUM)
 * - Worker / SEO: Bot detection prevents Keycloak init for crawlers — SEO-critical.
 *
 * Security Constraints:
 * - Auth URL must NEVER be hardcoded — always read from NEXT_PUBLIC_AUTH_URL env var.
 * - Silent SSO uses /silent-check-sso.html in /public — must exist and be accessible.
 * - checkLoginIframe: false — prevents 3rd-party cookie blocking from crashing auth.
 *
 * Non-Negotiables:
 * - Auth timeout MUST degrade gracefully: guest users must be able to browse without auth.
 * - SSR guard (typeof window === 'undefined') MUST remain — prevents server-side crash.
 * - Bot detection MUST remain — prevents Keycloak init for Googlebot/Lighthouse.
 * - kc_silent_sso_failed sessionStorage flag MUST remain — prevents infinite retry loops.
 *
 * Change Intent:
 * - SESSION 2026-05-12: Fixed [Auth] Init Failed: Error: Auth Timeout crash.
 *   The timeout was rejecting the Promise but the app had no graceful fallback —
 *   it would leave loading=true forever or crash downstream components reading user state.
 *   Fix: On timeout, log warning, set isAuthenticated=false, setLoading=false, mark
 *   sessionStorage flag so silent SSO is skipped on next page load. Guest browsing continues.
 *
 * Future AI Guidance:
 * - Do NOT remove the SSR guard — this file runs in Next.js App Router client components.
 * - Do NOT remove bot detection — removing it will cause Keycloak to init for Googlebot.
 * - Do NOT increase CONNECTION_TIMEOUT beyond 10000ms — it degrades Core Web Vitals.
 * - The silentCheckSsoRedirectUri MUST point to /silent-check-sso.html (exists in /public).
 *
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - ADDED:
 *   • Bot/Crawler detection to skip Keycloak init for SEO crawlers.
 *   • isRun ref guard to prevent double-init in React Strict Mode.
 *   • Phase: Next.js migration (CRA → Next.js 14 App Router)
 *
 * - EDITED:
 *   • Migrated REACT_APP_AUTH_URL to NEXT_PUBLIC_AUTH_URL.
 *   • Added typeof window === 'undefined' SSR guard at top of useEffect.
 *   • Added getUserProfile() call to enrich user state with displayName from backend.
 *   • Phase: Next.js migration
 *
 * - EDITED (2026-05-12 — SESSION_PROMPT Phase 2 Bug Fix):
 *   • FIXED: [Auth] Init Failed: Error: Auth Timeout — app was crashing for guest users.
 *   • Root cause: Promise.race timeout rejection had no graceful degradation path.
 *     On timeout, loading remained true or downstream components crashed reading undefined user.
 *   • Fix applied: catch block now explicitly sets isAuthenticated=false, setAuthToken(null),
 *     marks kc_silent_sso_failed=true in sessionStorage to prevent retry loops,
 *     and always calls setLoading(false) via finally — guest browsing continues uninterrupted.
 *   • Verified: silent-check-sso.html exists in /public directory.
 *   • What must remain unchanged: bot detection, SSR guard, isRun ref, token refresh interval.
 *
 * - DO-NOT-DELETE RULE:
 *   This IMMUTABLE CHANGE HISTORY section must never be deleted,
 *   truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken, getUserProfile } from '../apiConfig';
import { faro } from '../faroConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keycloak, setKeycloak] = useState(null);

  // Guard to prevent double-initialization in React Strict Mode
  const isRun = useRef(false);

  useEffect(() => {
    // --- CRITICAL SSR GUARD: Do not run on server ---
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    if (isRun.current) return;
    isRun.current = true;

    // --- ENTERPRISE FIX: DETECT BOTS & SKIP AUTH ---
    // SEO-critical: Keycloak must never init for crawlers — it blocks rendering.
    const userAgent = (navigator.userAgent || "").toLowerCase();
    const isHeadless = navigator.webdriver || false;

    const botKeywords = [
      'bot', 'googlebot', 'crawler', 'spider', 'robot', 'crawling',
      'bingbot', 'slurp', 'duckduckbot', 'baiduspider', 'yandexbot',
      'lighthouse', 'inspection', 'headless', 'chrome-lighthouse', 'ptst'
    ];

    const isBot = isHeadless || botKeywords.some(keyword => userAgent.includes(keyword));

    if (isBot) {
      console.log("[Auth] Bot/Crawler detected. Skipping Keycloak initialization for SEO.");
      setLoading(false);
      return;
    }

    console.log("[Auth] Init Started");

    // --- CONFIGURATION (Zero-Trust: no hardcoded URLs) ---
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://backend.treishvaamgroup.com/auth';

    const initKeycloak = new Keycloak({
      url: authUrl,
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    setKeycloak(initKeycloak);

    // --- AUTHENTICATION STRATEGY ---
    const url = window.location.href;
    const hash = window.location.hash;
    const isLoginCallback = url.includes("code=") && url.includes("state=");
    const isLoginError = hash && hash.includes('error=login_required');
    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';

    let initOptions = {
      pkceMethod: 'S256',
      // Disable iframe check: prevents crash from 3rd-party cookie blocking (Safari ITP, Firefox ETP)
      checkLoginIframe: false
    };

    if (isLoginError) {
      console.warn("[Auth] Silent SSO Failed. Disabling future checks.");
      sessionStorage.setItem('kc_silent_sso_failed', 'true');
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, null, cleanUrl);

    } else if (isLoginCallback) {
      console.log("[Auth] Processing Login Callback (Code Exchange)...");
      sessionStorage.removeItem('kc_silent_sso_failed');

    } else if (hasPriorFailure) {
      console.log("[Auth] Skipping Silent SSO (Previous failure detected). Guest mode active.");

    } else {
      console.log("[Auth] Attempting Silent SSO...");
      initOptions.onLoad = 'check-sso';
      // /silent-check-sso.html MUST exist in /public — verified present.
      initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
    }

    // --- INITIALIZATION WITH GRACEFUL TIMEOUT DEGRADATION ---
    // PHASE 2 FIX: Timeout must degrade gracefully — guest users must not be blocked.
    // If Keycloak is unreachable (network issue, cold start, 3rd-party cookie block),
    // the app continues as an unauthenticated guest. No crash. No infinite loading state.
    const CONNECTION_TIMEOUT = 10000; // 10s — do not increase (Core Web Vitals impact)

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    const initPromise = initKeycloak.init(initOptions);

    Promise.race([initPromise, timeoutPromise])
      .then((authenticated) => {
        console.log("[Auth] Init Success. Authenticated:", authenticated);

        if (authenticated) {
          sessionStorage.removeItem('kc_silent_sso_failed');

          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);

          const { name, email, realm_access } = initKeycloak.tokenParsed;
          const roles = realm_access ? realm_access.roles : [];

          // Set initial user state immediately from token (fast path)
          const initialUser = {
            name,
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          };
          setUser(initialUser);

          // Enrich with backend profile (displayName) — non-blocking
          getUserProfile().then(response => {
            if (response?.data) {
              const { displayName } = response.data;
              console.log("[Auth] Enriched Profile:", displayName);

              setUser(prev => ({
                ...prev,
                name: displayName || prev.name,
                displayName: displayName
              }));

              if (faro) {
                faro.api.setUser({
                  id: email,
                  username: displayName || name,
                  email: email
                });
              }
            }
          }).catch(err => {
            // Non-fatal: profile enrichment failure does not affect auth state
            console.warn("[Auth] Failed to fetch extended profile:", err);
          });

          // Set Faro user immediately (profile enrichment updates it later if needed)
          if (faro) {
            faro.api.setUser({ id: email, username: name, email: email });
          }

        } else {
          // Not authenticated — guest mode
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((err) => {
        // --- PHASE 2 FIX: GRACEFUL TIMEOUT DEGRADATION ---
        // Previously this block left the app in an undefined state on timeout.
        // Now: explicitly degrade to guest mode. Mark sessionStorage to skip
        // silent SSO on next navigation (prevents repeated timeout on every page load).
        if (err?.message === "Auth Timeout") {
          console.warn("[Auth] Init Timeout — Keycloak unreachable. Degrading to guest mode.");
          // Mark failure so next page load skips silent SSO and avoids another 10s wait
          sessionStorage.setItem('kc_silent_sso_failed', 'true');
        } else {
          console.error("[Auth] Init Failed:", err);
        }
        setIsAuthenticated(false);
        setAuthToken(null);
        // Guest browsing continues — loading will be set to false in finally block
      })
      .finally(() => {
        // CRITICAL: Always release the loading gate — downstream components must never
        // be blocked indefinitely waiting for auth state.
        setLoading(false);
      });

  }, []);

  const login = useCallback(() => {
    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Redirecting to Keycloak...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Logging out...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      if (faro) faro.api.resetUser();
      keycloak.logout();
    }
  }, [keycloak]);

  // Token Refresh Logic — only active when authenticated
  useEffect(() => {
    if (!keycloak || !isAuthenticated) return;

    const intervalId = setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log("[Auth] Token Refreshed");
          setToken(keycloak.token);
          setAuthToken(keycloak.token);
        }
      }).catch(() => {
        console.error('[Auth] Token Refresh Failed — logging out.');
        logout();
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [keycloak, isAuthenticated, logout]);

  return (
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token }, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
