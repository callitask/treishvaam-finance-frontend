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
 * - EDITED (Current Phase - Hydration Root Cause Fix):
 * • ROOT CAUSE: `useState(() => typeof window !== 'undefined')` caused an explicit hydration
 * mismatch between SSR (false) and CSR (true), triggering React Errors #418, #423, #425.
 * • FIX: Enforced deterministic initial state `useState(false)`. `loading` is switched to
 * `true` inside the `useEffect` (post-hydration) only if the user is not a bot. This perfectly
 * aligns server and client render trees while maintaining Keycloak init blocking for bots.
 * - EDITED (Current Phase - Root Cause Fix 2026-05-19):
 * • ROOT CAUSE IDENTIFIED: Keycloak is configured with `response_mode=fragment`, meaning
 * the authorization code arrives in the URL hash (`#state=...&code=...`), NOT the query
 * string. The previous code checked `window.location.hash` AFTER Keycloak's JS adapter
 * had already cleared it during init — making `isLoginCallback` always false on the
 * callback page, so silent SSO was attempted instead of code exchange, which failed.
 * • FIX: Snapshot `window.location.href`, `.hash`, and `.search` once at the very top
 * of the useEffect, before ANY Keycloak init call that could mutate the URL/hash.
 * These snapshots are used for ALL isLoginCallback detection throughout the function,
 * including inside the catch block where Keycloak has already cleared the hash.
 * • FIX: Added `responseMode: 'fragment'` to Keycloak initOptions to explicitly match
 * the server configuration and prevent mode mismatch during code exchange.
 * • FIX: Re-added `fatalError` state which was accidentally removed in a prior edit.
 * Without it, `PrivateRoute`'s `auth.fatalError` check was always `undefined`, making
 * the fatal loop breaker completely non-functional.
 * • FIX: `hasFatalFailure` now short-circuits the entire init when active, setting
 * `fatalError: true` and stopping Keycloak from re-running.
 * • FIX: `login()` now reloads to /login on fatal breaker (instead of alert) and reloads
 * the page if keycloak is null (instead of silently aborting).
 * - EDITED (Auth Loop Relaxation):
 * • Demoted the `CSP_BLOCK_OR_UNDEFINED` error from triggering a FATAL loop breaker to a graceful Guest Mode degradation.
 * • Why: The strict Edge Worker CSP was blocking the `silent-check-sso.html` iframe communication on some devices, falsely triggering the Anti-Loop breaker and hard-locking the auth state.
 * - EDITED (Session Salvage Operation):
 * • ADDED: Interception inside the `.catch()` block to salvage the Keycloak object. If the iframe fails (`CSP_BLOCK_OR_UNDEFINED`) but `initKeycloak.token` was successfully provisioned, it overrides the failure and mounts the user session securely, breaking the login refresh loop.
 * - EDITED (Next.js Hash Normalization Fix):
 * • Changed `responseMode` from `fragment` to `query`.
 * • Why: Next.js 14 App Router aggressively normalizes URLs and strips hash fragments (`#state=...&code=...`) before the component mounts. By forcing Keycloak to use the query string (`?state=...&code=...`), we bypass Next.js hash stripping, allowing the OIDC code exchange to complete successfully and permanently resolving the login redirect loop.
 */
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken, getUserProfile } from '../apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keycloak, setKeycloak] = useState(null);
  const [fatalError, setFatalError] = useState(false);

  const isRun = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
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
      return;
    }

    setLoading(true);

    const snapshotHref = window.location.href;
    const snapshotHash = window.location.hash;
    const snapshotSearch = window.location.search;

    const isLoginCallback =
      (snapshotSearch.includes("code=") || snapshotHash.includes("code=")) &&
      snapshotHref.includes("state=");

    const isLoginError =
      snapshotHash.includes('error=login_required') ||
      snapshotSearch.includes('error=login_required');

    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';
    const hasFatalFailure = sessionStorage.getItem('kc_fatal_loop_breaker') === 'true';

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

    setKeycloak(initKeycloak);

    let initOptions = {
      pkceMethod: 'S256',
      checkLoginIframe: false,
      responseMode: 'query', // FIXED: Switched to query to survive Next.js hash normalization
    };

    if (isLoginError) {
      console.warn("[Auth] Silent SSO error detected in URL. Disabling future checks.");
      sessionStorage.setItem('kc_silent_sso_failed', 'true');
      window.history.replaceState(null, null, window.location.pathname);
    } else if (isLoginCallback) {
      console.log("[Auth] Processing Login Callback (Code Exchange)...");
      sessionStorage.removeItem('kc_silent_sso_failed');
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
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((rawErr) => {
        const err = rawErr === undefined ? "CSP_BLOCK_OR_UNDEFINED" : rawErr;
        console.error("[Auth] Init Failed:", err);

        // --- SESSION SALVAGE OPERATION ---
        if (err === "CSP_BLOCK_OR_UNDEFINED" && initKeycloak.token) {
          console.log("[Auth] Session Salvaged! Token acquired despite iframe CSP block.");
          sessionStorage.removeItem('kc_silent_sso_failed');
          sessionStorage.removeItem('kc_fatal_loop_breaker');

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
            console.warn("[Auth] Salvage Faro instrumentation failed", e);
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
            console.warn("[Auth] Failed to fetch extended profile during salvage:", err);
          });

          return;
        }
        // --- END SALVAGE ---

        const callbackCodeDetected = snapshotSearch.includes('code=') || snapshotHash.includes('code=');

        if (callbackCodeDetected && err !== "CSP_BLOCK_OR_UNDEFINED") {
          console.error("[Auth] FATAL: Token exchange failed after callback. Engaging Anti-Loop breaker.");
          sessionStorage.setItem('kc_fatal_loop_breaker', 'true');
          setFatalError(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.warn("[Auth] Non-fatal init failure (or CSP Block). Degrading to guest mode.", err);
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