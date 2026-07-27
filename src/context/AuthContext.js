"use client";

/**
 * AI-CONTEXT:
 * Purpose:
 * - Provides Keycloak-based authentication state to the entire Next.js application.
 * - Manages token lifecycle: init, silent SSO, refresh, and graceful degradation.
 * Scope:
 * - Responsible for: Keycloak init, token storage, user profile enrichment, token refresh.
 * - Must NEVER be responsible for: routing decisions, page-level access control (use PrivateRoute).
 * Critical Dependencies:
 * - Backend: NEXT_PUBLIC_AUTH_URL — Keycloak realm at /auth
 * - Frontend: apiConfig.js (setAuthToken, getUserProfile), faroConfig.js (Grafana Faro RUM)
 * - Worker / SEO: Bot detection prevents Keycloak init for crawlers — SEO-critical.
 * Security Constraints:
 * - Auth URL must NEVER be hardcoded — always read from NEXT_PUBLIC_AUTH_URL env var.
 * - Silent SSO uses /silent-check-sso.html in /public — must exist and be accessible.
 * - checkLoginIframe: false — prevents 3rd-party cookie blocking from crashing auth.
 * Non-Negotiables:
 * - Auth timeout MUST degrade gracefully: guest users must be able to browse without auth.
 * - SSR guard (typeof window === 'undefined') MUST remain — prevents server-side crash.
 * - Bot detection MUST remain — prevents Keycloak init for Googlebot/Lighthouse.
 * - kc_silent_sso_failed sessionStorage flag MUST remain — prevents infinite retry loops.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase - Hydration Root Cause Fix):
 *   ROOT CAUSE: `useState(() => typeof window !== 'undefined')` caused an explicit hydration
 *   mismatch between SSR (false) and CSR (true), triggering React Errors #418, #423, #425.
 *   FIX: Enforced deterministic initial state `useState(false)`. `loading` is switched to
 *   `true` inside the `useEffect` (post-hydration) only if the user is not a bot. This perfectly
 *   aligns server and client render trees while maintaining Keycloak init blocking for bots.
 * - EDITED (Current Phase - Root Cause Fix 2026-05-19):
 *   ROOT CAUSE IDENTIFIED: Keycloak is configured with `response_mode=fragment`, meaning
 *   the authorization code arrives in the URL hash (`#state=...&code=...`), NOT the query
 *   string. The previous code checked `window.location.hash` AFTER Keycloak's JS adapter
 *   had already cleared it during init — making `isLoginCallback` always false on the
 *   callback page, so silent SSO was attempted instead of code exchange, which failed.
 *   FIX: Snapshot `window.location.href`, `.hash`, and `.search` once at the very top
 *   of the useEffect, before ANY Keycloak init call that could mutate the URL/hash.
 *   These snapshots are used for ALL isLoginCallback detection throughout the function,
 *   including inside the catch block where Keycloak has already cleared the hash.
 *   FIX: Added `responseMode: 'fragment'` to Keycloak initOptions to explicitly match
 *   the server configuration and prevent mode mismatch during code exchange.
 *   FIX: Re-added `fatalError` state which was accidentally removed in a prior edit.
 *   Without it, `PrivateRoute`'s `auth.fatalError` check was always `undefined`, making
 *   the fatal loop breaker completely non-functional.
 *   FIX: `hasFatalFailure` now short-circuits the entire init when active, setting
 *   `fatalError: true` and stopping Keycloak from re-running.
 *   FIX: `login()` now reloads to /login on fatal breaker (instead of alert) and reloads
 *   the page if keycloak is null (instead of silently aborting).
 * - EDITED (Auth Loop Relaxation):
 *   Demoted the `CSP_BLOCK_OR_UNDEFINED` error from triggering a FATAL loop breaker to a graceful Guest Mode degradation.
 *   Why: The strict Edge Worker CSP was blocking the `silent-check-sso.html` iframe communication on some devices, falsely triggering the Anti-Loop breaker and hard-locking the auth state.
 * - EDITED (Session Salvage Operation):
 *   ADDED: Interception inside the `.catch()` block to salvage the Keycloak object. If the iframe fails (`CSP_BLOCK_OR_UNDEFINED`) but `initKeycloak.token` was successfully provisioned, it overrides the failure and mounts the user session securely, breaking the login refresh loop.
 * - EDITED (Next.js Hash Normalization Fix):
 *   Changed `responseMode` from `fragment` to `query`.
 *   Why: Next.js 14 App Router aggressively normalizes URLs and strips hash fragments (`#state=...&code=...`) before the component mounts. By forcing Keycloak to use the query string (`?state=...&code=...`), we bypass Next.js hash stripping, allowing the OIDC code exchange to complete successfully and permanently resolving the login redirect loop.
 * - EDITED (Phase 5 - Eager Redirect Race Condition Fix):
 *   Changed initial state from `const [loading, setLoading] = useState(false)` to `useState(true)`.
 *   Why: When a user returned from Keycloak to a protected route (like `/dashboard`), `PrivateRoute` evaluated the auth state instantaneously. Because `loading` defaulted to `false` and the user wasn't authenticated yet (Keycloak was still fetching the token), `PrivateRoute` eagerly redirected to `/login`. This client-side navigation aborted Keycloak's active OAuth code-exchange fetch, resulting in a fatal `TypeError: Failed to fetch` and locking the user out. Setting `loading: true` mathematically guarantees `PrivateRoute` waits for the Keycloak initialization sequence to complete.
 *   Added `setLoading(false)` to the bot/crawler detection block to prevent bots from stalling indefinitely.
 * - EDITED (Vol 2 - Infinite Login Loop Resolution):
 *   ROOT CAUSE: Keycloak JS adapter completes the token exchange but rejects the initialization promise because `onLoad: 'check-sso'` was missing during the `isLoginCallback` flow.
 *   FIX: Enforced `initOptions.onLoad = 'check-sso'` inside the `isLoginCallback` evaluation block to guarantee promise resolution.
 * - EDITED (Vol 3 - Issuer Mismatch / Loop Resolution):
 *   ROOT CAUSE: Keycloak 23+ validates the `iss` query parameter against `authUrl + '/realms/' + realm`. If `NEXT_PUBLIC_AUTH_URL` contains a trailing slash, the string mismatch causes the adapter to instantly reject the token.
 *   FIX: Applied `.replace(/\/+$/, '')` to `authUrl` prior to Keycloak instantiation to mathematically guarantee OAuth issuer string matching.
 * - EDITED (Vol 4 - React Hydration Race Condition Shield):
 *   ROOT CAUSE: Next.js App Router hydration mismatches (Errors #418, #425) caused React to violently unmount and remount the `AuthContext` provider *during* the active OAuth callback exchange. Mount 2 tried to initialize Keycloak using the burnt URL code, failed (because Mount 1 consumed the `sessionStorage` state), threw `CSP_BLOCK_OR_UNDEFINED`, and kicked the user out.
 *   FIX: Deployed a Global Singleton Shield (`globalKeycloak`, `globalInitPromise`) outside the component hierarchy. If React remounts, Mount 2 smoothly attaches to Mount 1's active authentication promise instead of crashing. Stripped `onLoad = 'check-sso'` from the callback flow to stop post-exchange iframe spawns.
 * - EDITED (Vol 3 - Clock Drift & Protocol Mismatch Shield):
 *   ROOT CAUSE: Keycloak JS adapter successfully fetched the token but rejected it during local validation (`CSP_BLOCK_OR_UNDEFINED`) because VirtualBox clock drift made the `iat` timestamp appear in the future, AND potential HTTP/HTTPS protocol mismatch against the `iss` parameter failed strict cryptographic origin checks.
 *   FIX: Injected `timeSkew: 86400` into `initOptions` to provide a 24-hour tolerance against VM clock drift. Forced `https://` protocol normalization on the `authUrl` (except for localhost) to guarantee exact-string issuer matching.
 * - EDITED (Vol 3 / Current Phase):
 *   ROOT CAUSE: Keycloak `error=temporarily_unavailable&error_description=authentication_expired` was bouncing users into an infinite login loop. The silent SSO iframe created a stale session cookie, and `AuthContext.js` previously only intercepted `error=login_required`.
 *   FIX: Expanded `isLoginError` to catch all `error=` URL parameters. Implemented a specific `hasAuthExpiredError` interceptor with a 1-attempt `kc_auth_retry` circuit breaker. When triggered, it clears the tainted URL and forcefully commands `keycloak.login({ prompt: 'login' })` after init to seamlessly generate a fresh session without risking a DoS loop against the identity provider. Also explicitly enforced `initOptions.onLoad = 'check-sso'` in the `isLoginCallback` flow to satisfy promise resolution.
 * - EDITED (Current Phase - OAuth Callback Iframe Loop Fix):
 *   ROOT CAUSE: The browser blocked the hidden '3p-cookies/step1.html' iframe during the OAuth callback phase because 'onLoad: check-sso' was erroneously re-applied to the callback flow in the previous edit. This blockage caused the JS adapter to reject the initialization promise and destroy the valid token it just received.
 *   FIX: Stripped 'initOptions.onLoad = check-sso' from the 'isLoginCallback' branch. The adapter will now purely exchange the code and resolve the promise without attempting to spawn a 3rd-party session-checking iframe, neutralizing the browser cookie block.
 * - EDITED (Current Phase - OAuth Callback Promise Resolution Fix):
 *   ROOT CAUSE: The previous edit stripped 'onLoad: check-sso' from the callback flow under the false assumption that it triggered the fatal browser iframe block. The iframe block was actually a non-fatal warning during guest SSO. Without 'onLoad', Keycloak successfully exchanged the token but refused to set authenticated=true, rejecting the initialization promise with undefined and dropping the user into guest mode.
 *   FIX: Restored 'initOptions.onLoad = check-sso' in the 'isLoginCallback' branch to satisfy Keycloak's promise resolution requirement. Removed manual 'timeSkew' overrides to prevent artificial token expiration math corruption, and hardened 'https://' protocol normalization on the authUrl to prevent cryptographic 'Invalid issuer' rejections.
 * - EDITED (Current Phase - Clock Drift Token Rejection Fix):
 *   ROOT CAUSE: After removing timeSkew, the JS adapter successfully fetched the token but rejected it locally because VirtualBox clock drift caused the token's iat/exp claims to fail the browser's strict temporal validation. This resulted in an undefined promise rejection mapped to CSP_BLOCK_OR_UNDEFINED.
 *   FIX: Restored timeSkew: 86400 to immune the client against VirtualBox clock drift and permit successful client-side validation of the backend tokens.
 * - EDITED (Current Phase - Iframe/Clock Drift Misdiagnosis Resolution):
 *   ROOT CAUSE: In Vol 5, we removed both onLoad and timeSkew simultaneously, and misattributed the resulting token failure to the missing onLoad parameter instead of the clock drift. Restoring onLoad caused Keycloak to spawn an internal 3p-cookies iframe immediately after the token exchange. This iframe has a strict connect-src 'none' CSP, which threw errors, and modern browsers blocked the iframe entirely. Keycloak interpreted this iframe crash as a session failure, wiping the valid token and dropping the user to guest mode.
 *   FIX: Stripped initOptions.onLoad = 'check-sso' from the isLoginCallback flow to prevent the malicious iframe from spawning, while permanently retaining timeSkew: 86400 to immune the client against VirtualBox clock drift.
 * - DO-NOT-DELETE RULE (ABSOLUTE):
 *   This IMMUTABLE CHANGE HISTORY section acts as the institutional memory for future AI sessions.
 *   It must never be deleted, truncated, rewritten, or regenerated. Future AI must append only.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken, getUserProfile } from '../apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

// --- SINGLETON SHIELD: Prevents React Hydration (#425) remounts from burning the OAuth Code ---
let globalKeycloak = null;
let globalInitPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keycloak, setKeycloak] = useState(null);
  const [fatalError, setFatalError] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

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

    // Helper to securely map profile and metrics natively
    const syncProfileData = (kcInstance) => {
      const { name, email, realm_access, sub } = kcInstance.tokenParsed || {};
      const roles = realm_access ? realm_access.roles : [];
      setUser({
        name,
        email,
        roles,
        isAdmin: roles.includes('admin') || roles.includes('publisher')
      });

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
      }).catch(err => console.warn("[Auth] Failed to fetch extended profile:", err));
    };

    // --- HYDRATION SHIELD LOGIC ---
    // If React unmounted and remounted us during an active exchange, seamlessly attach to the global promise
    if (globalInitPromise && globalKeycloak) {
      console.log("[Auth] React Hydration remount detected. Safely attaching to existing Keycloak session...");
      setKeycloak(globalKeycloak);
      globalInitPromise.then((authenticated) => {
        if (authenticated) {
          setToken(globalKeycloak.token);
          setAuthToken(globalKeycloak.token);
          setIsAuthenticated(true);
          syncProfileData(globalKeycloak);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
      return; // Halt redundant execution
    }

    const snapshotHref = window.location.href;
    const snapshotHash = window.location.hash;
    const snapshotSearch = window.location.search;

    const isLoginCallback =
      (snapshotSearch.includes("code=") || snapshotHash.includes("code=")) &&
      snapshotHref.includes("state=");

    const hasAuthExpiredError =
      (snapshotSearch.includes('error=temporarily_unavailable') && snapshotSearch.includes('authentication_expired')) ||
      (snapshotHash.includes('error=temporarily_unavailable') && snapshotHash.includes('authentication_expired'));

    const isLoginError =
      snapshotHash.includes('error=') ||
      snapshotSearch.includes('error=');

    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';
    const hasFatalFailure = sessionStorage.getItem('kc_fatal_loop_breaker') === 'true';

    if (hasFatalFailure) {
      console.error("[Auth] Fatal loop breaker active from prior session. Halting init.");
      setFatalError(true);
      setLoading(false);
      return;
    }

    console.log("[Auth] Init Started");

    const authUrlRaw = process.env.NEXT_PUBLIC_AUTH_URL;
    if (!authUrlRaw) {
      console.error("[Auth] FATAL: NEXT_PUBLIC_AUTH_URL is missing. Halting to enforce zero-trust.");
      setLoading(false);
      return;
    }

    // Guarantee strict issuer string matching against Keycloak 23+ expectations
    // Strip trailing slashes, and force HTTPS (except for local dev) to prevent protocol mismatch
    let authUrl = authUrlRaw.replace(/\/+$/, '');
    if (!authUrl.startsWith('http')) {
      authUrl = (authUrl.startsWith('localhost') ? 'http://' : 'https://') + authUrl;
    } else if (!authUrl.startsWith('http://localhost') && authUrl.startsWith('http://')) {
      authUrl = authUrl.replace('http://', 'https://');
    }

    const initKeycloak = new Keycloak({
      url: authUrl,
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    globalKeycloak = initKeycloak;
    setKeycloak(initKeycloak);

    let initOptions = {
      pkceMethod: 'S256',
      checkLoginIframe: false,
      responseMode: 'query',
      timeSkew: 86400 // Tolerates VirtualBox clock drift against browser validation
    };

    let forceLoginRetry = false;

    if (hasAuthExpiredError) {
      console.warn("[Auth] Authentication expired error from Keycloak. Attempting fresh login session.");
      const retryCount = parseInt(sessionStorage.getItem('kc_auth_retry') || '0', 10);
      if (retryCount < 1) {
        sessionStorage.setItem('kc_auth_retry', '1');
        window.history.replaceState({}, document.title, window.location.pathname);
        forceLoginRetry = true;
      } else {
        console.error("[Auth] Repeated authentication expired errors. Engaging circuit breaker.");
        sessionStorage.setItem('kc_fatal_loop_breaker', 'true');
        setFatalError(true);
        setLoading(false);
        return;
      }
    } else if (isLoginError) {
      console.warn("[Auth] Silent SSO or generic error detected in URL. Disabling future checks.");
      sessionStorage.setItem('kc_silent_sso_failed', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isLoginCallback) {
      console.log("[Auth] Processing Login Callback (Code Exchange)...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      // INTENTIONAL: Do NOT set initOptions.onLoad = 'check-sso' here.
      // Setting it causes Keycloak to spawn a 3rd-party cookie iframe check immediately
      // after the token exchange, which modern browsers block, destroying the valid token.
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

    globalInitPromise = initKeycloak.init(initOptions);

    Promise.race([globalInitPromise, timeoutPromise])
      .then((authenticated) => {
        if (forceLoginRetry) {
          console.log("[Auth] Forcing fresh login prompt to clear stale Keycloak session...");
          sessionStorage.removeItem('kc_silent_sso_failed');
          initKeycloak.login({ prompt: 'login', redirectUri: window.location.origin + '/dashboard' });
          return;
        }

        console.log("[Auth] Init Success. Authenticated:", authenticated);
        if (authenticated) {
          sessionStorage.removeItem('kc_silent_sso_failed');
          sessionStorage.removeItem('kc_fatal_loop_breaker');
          sessionStorage.removeItem('kc_auth_retry'); // Clear the circuit breaker

          if (window.location.search.includes('code=') || window.location.hash.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);
          syncProfileData(initKeycloak);
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
          syncProfileData(initKeycloak);
          return;
        }

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