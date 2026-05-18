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
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase - Root Cause Fix 2026-05-19):
 * • ROOT CAUSE IDENTIFIED: Keycloak is configured with `response_mode=fragment`, meaning
 *   the authorization code arrives in the URL hash (`#state=...&code=...`), NOT the query
 *   string. The previous code checked `window.location.hash` AFTER Keycloak's JS adapter
 *   had already cleared it during init — making `isLoginCallback` always false on the
 *   callback page, so silent SSO was attempted instead of code exchange, which failed.
 * • FIX: Snapshot `window.location.href`, `.hash`, and `.search` once at the very top
 *   of the useEffect, before ANY Keycloak init call that could mutate the URL/hash.
 *   These snapshots are used for ALL isLoginCallback detection throughout the function,
 *   including inside the catch block where Keycloak has already cleared the hash.
 * • FIX: Added `responseMode: 'fragment'` to Keycloak initOptions to explicitly match
 *   the server configuration and prevent mode mismatch during code exchange.
 * • FIX: Re-added `fatalError` state which was accidentally removed in a prior edit.
 *   Without it, `PrivateRoute`'s `auth.fatalError` check was always `undefined`, making
 *   the fatal loop breaker completely non-functional.
 * • FIX: `hasFatalFailure` now short-circuits the entire init when active, setting
 *   `fatalError: true` and stopping Keycloak from re-running.
 * • FIX: `loading` initial state changed to a lazy initializer function — the cleanest
 *   pattern to avoid React hydration errors #418, #423, #425.
 * • FIX: `login()` now reloads to /login on fatal breaker (instead of alert) and reloads
 *   the page if keycloak is null (instead of silently aborting).
 * - EDITED: Moved `setKeycloak(initKeycloak)` immediately after construction, prior to
 *   `Promise.race()`. Why: If silent SSO fails (guest mode), placing it inside `.then()`
 *   left `keycloak` null, breaking the manual `login()` function.
 * - EDITED: Consolidated URL scrubbing in catch block to use snapshotted href values —
 *   NOT live window.location — because Keycloak clears the hash before catch fires.
 * - EDITED: Injected `kc_fatal_loop_breaker` into the catch block.
 * - EDITED: Removed hardcoded fallback for `authUrl` to enforce absolute Zero-Trust.
 * - EDITED: Added explicit handling for primitive `undefined` rejections in Keycloak catch.
 * - ADDED: Bot/Crawler detection, isRun ref guard.
 * - EDITED: Migrated REACT_APP_AUTH_URL to NEXT_PUBLIC_AUTH_URL.
 * - EDITED: Fixed Auth Timeout crash by degrading to guest mode smoothly.
 * - EDITED (2026-05-13): Hardened `tokenParsed` destructuring with an empty fallback object.
 * - EDITED: Updated `login()` method to enforce strict redirection to `/dashboard` post-auth.
 * - EDITED (HOTFIX): Sanitized `faro.api.setUser` payload with safe string fallbacks.
 * - EDITED (INFINITE LOOP FIX): Wrapped Faro SDK calls in strict `try/catch` and added
 *   `window.history.replaceState` scrubber.
 *
 * - DO-NOT-DELETE RULE:
 * This IMMUTABLE CHANGE HISTORY section must never be deleted,
 * truncated, rewritten, or regenerated. Future AI must append only.
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
  // HYDRATION FIX: Lazy initializer — server evaluates to false (no auth on server),
  // client evaluates to true (needs to check auth). Eliminates React errors #418/#423/#425.
  const [loading, setLoading] = useState(() => typeof window !== 'undefined');
  const [keycloak, setKeycloak] = useState(null);
  // LOOP BREAKER: fatalError surfaces token exchange failures to PrivateRoute,
  // preventing it from redirecting to /login in an infinite loop.
  const [fatalError, setFatalError] = useState(false);

  const isRun = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    if (isRun.current) return;
    isRun.current = true;

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

    // CRITICAL: Snapshot URL state BEFORE Keycloak init — the JS adapter clears
    // window.location.hash during init() when it detects a callback. Any check
    // on window.location.hash AFTER init() runs will always be empty.
    const snapshotHref = window.location.href;
    const snapshotHash = window.location.hash;
    const snapshotSearch = window.location.search;

    // Detect login callback. Keycloak uses response_mode=fragment so code arrives in hash.
    const isLoginCallback =
      (snapshotSearch.includes("code=") || snapshotHash.includes("code=")) &&
      snapshotHref.includes("state=");

    const isLoginError =
      snapshotHash.includes('error=login_required') ||
      snapshotSearch.includes('error=login_required');

    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';
    const hasFatalFailure = sessionStorage.getItem('kc_fatal_loop_breaker') === 'true';

    // Short-circuit: if a fatal failure was recorded in a prior page load,
    // surface the error immediately without re-running Keycloak init.
    if (hasFatalFailure) {
      console.error("[Auth] Fatal loop breaker active from prior session. Halting init.");
      setFatalError(true);
      setLoading(false);
      return;
    }

    console.log("[Auth] Init Started");

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

    if (!authUrl) {
      console.error("[Auth] FATAL: NEXT_PUBLIC_AUTH_URL is missing. Halting to enforce zero-trust.");
      setLoading(false);
      return;
    }

    const initKeycloak = new Keycloak({
      url: authUrl,
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    // Set keycloak state immediately so login() callback works even after
    // a failed silent SSO (when user is in guest mode).
    setKeycloak(initKeycloak);

    let initOptions = {
      pkceMethod: 'S256',
      checkLoginIframe: false,
      // Explicitly set fragment response mode to match Keycloak server config.
      // Without this the adapter may default to query mode and miss hash-delivered codes.
      responseMode: 'fragment',
    };

    if (isLoginError) {
      console.warn("[Auth] Silent SSO error detected in URL. Disabling future checks.");
      sessionStorage.setItem('kc_silent_sso_failed', 'true');
      window.history.replaceState(null, null, window.location.pathname);
    } else if (isLoginCallback) {
      console.log("[Auth] Processing Login Callback (Code Exchange)...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      // No onLoad needed — Keycloak detects code in URL automatically during init().
    } else if (hasPriorFailure) {
      console.log("[Auth] Skipping Silent SSO (Previous failure detected). Guest mode active.");
    } else {
      console.log("[Auth] Attempting Silent SSO...");
      initOptions.onLoad = 'check-sso';
      initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
    }

    const CONNECTION_TIMEOUT = 25000;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    const initPromise = initKeycloak.init(initOptions);

    Promise.race([initPromise, timeoutPromise])
      .then((authenticated) => {
        console.log("[Auth] Init Success. Authenticated:", authenticated);

        if (authenticated) {
          sessionStorage.removeItem('kc_silent_sso_failed');
          sessionStorage.removeItem('kc_fatal_loop_breaker');

          // Clean the URL — remove hash/query leftover from Keycloak redirect.
          if (window.location.search.includes('code=') || window.location.hash.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);

          const { name, email, realm_access, sub } = initKeycloak.tokenParsed || {};
          const roles = realm_access ? realm_access.roles : [];

          const initialUser = {
            name,
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          };
          setUser(initialUser);

          const safeId = String(sub || email || 'anonymous-id');
          const safeEmail = String(email || 'anonymous@treishvaam.com');
          const safeName = String(name || 'Anonymous User');

          try {
            if (window.faro && window.faro.api) {
              window.faro.api.setUser({ id: safeId, username: safeName, email: safeEmail });
            }
          } catch (e) {
            console.warn("[Auth] Initial Faro instrumentation failed", e);
          }

          getUserProfile().then(response => {
            if (response?.data) {
              const { displayName } = response.data;
              setUser(prev => ({ ...prev, name: displayName || prev.name, displayName }));
              try {
                if (window.faro && window.faro.api) {
                  window.faro.api.setUser({
                    id: safeId,
                    username: String(displayName || name || 'Anonymous User'),
                    email: safeEmail
                  });
                }
              } catch (e) { }
            }
          }).catch(err => {
            console.warn("[Auth] Failed to fetch extended profile:", err);
          });

        } else {
          // authenticated = false: silent SSO found no active session — normal for guests.
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((rawErr) => {
        const err = rawErr === undefined ? "CSP_BLOCK_OR_UNDEFINED" : rawErr;
        console.error("[Auth] Init Failed:", err);

        // CRITICAL: Use SNAPSHOTTED values — NOT live window.location.
        // Keycloak's adapter has already cleared window.location.hash by the time
        // this catch block runs, so checking it live always returns empty string.
        const callbackCodeDetected =
          snapshotSearch.includes('code=') || snapshotHash.includes('code=');

        if (callbackCodeDetected) {
          // Fatal: user authenticated at Keycloak, code was issued, but token exchange
          // failed (CORS rejection, network failure, or CSP block on token endpoint).
          // Engaging the loop breaker to prevent infinite /login redirect cycles.
          console.error("[Auth] FATAL: Token exchange failed after callback. Engaging Anti-Loop breaker.");
          sessionStorage.setItem('kc_fatal_loop_breaker', 'true');
          setFatalError(true);
          // Scrub the dead authorization code from the URL.
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Non-fatal: silent SSO session expired, network hiccup, or guest mode.
          // Record the failure so the next page load skips silent SSO entirely.
          console.warn("[Auth] Non-fatal init failure. Degrading to guest mode.", err);
          sessionStorage.setItem('kc_silent_sso_failed', 'true');
        }

        setIsAuthenticated(false);
        setAuthToken(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const login = useCallback(() => {
    if (sessionStorage.getItem('kc_fatal_loop_breaker') === 'true') {
      // Clear the breaker and reload to a clean login page state
      // so the user can retry without being permanently locked out.
      console.warn("[Auth] Fatal breaker active. Clearing state and reloading login page.");
      sessionStorage.removeItem('kc_fatal_loop_breaker');
      sessionStorage.removeItem('kc_silent_sso_failed');
      window.location.href = '/login';
      return;
    }

    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Redirecting to Keycloak...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
    } else {
      // keycloak object not ready (e.g., authUrl env var was missing on init).
      // Force a full reload so the init sequence reruns cleanly.
      console.warn("[Auth] Keycloak not ready. Reloading page to retry init.");
      window.location.reload();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Logging out...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      sessionStorage.removeItem('kc_fatal_loop_breaker');
      try {
        if (window.faro && window.faro.api) window.faro.api.resetUser();
      } catch (e) { }
      keycloak.logout();
    }
  }, [keycloak]);

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
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token, fatalError }, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};