"use client";
/**
 * AI-CONTEXT:
 * Purpose: Provides Keycloak-based authentication state to the entire Next.js application.
 * Scope: Responsible for: Keycloak init, token storage, user profile enrichment, token refresh.
 * Critical Dependencies: Backend: NEXT_PUBLIC_AUTH_URL, Frontend: apiConfig.js, faroConfig.js.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED (Current Phase - Final Loop & Hydration Fix):
 * • Changed initial `loading` state to `typeof window !== 'undefined'` to align SSR and client hydration states, fixing React errors #418, #423, #425.
 * • Broadened the `catch` block's `else` condition to catch structured Keycloak error objects (like `authentication_expired`). Previously it only caught hardcoded timeout strings, leaving standard session expiries uncaught and triggering infinite loops.
 * - EDITED: Increased CONNECTION_TIMEOUT from 10000ms to 25000ms to prevent token exchange races on Cloudflare cold starts.
 * - EDITED: Moved `setKeycloak(initKeycloak)` inside the successful `.then()` resolution block so `login()` is securely gated until initialization fully passes.
 * - EDITED: Exposed `fatalError` state to UI to halt `PrivateRoute` from triggering a redirect loop when a token exchange fatally fails.
 * - EDITED: Scrubbed callback check to use both hash and search safely.
 * - EDITED: Injected `kc_fatal_loop_breaker` state into the `catch` block.
 * - EDITED: Removed hardcoded fallback for `authUrl` to enforce absolute Zero-Trust.
 * - EDITED: Added explicit handling for primitive `undefined` rejections in the Keycloak `catch`.
 * - ADDED: Bot/Crawler detection, isRun ref guard.
 * - EDITED: Migrated REACT_APP_AUTH_URL to NEXT_PUBLIC_AUTH_URL.
 * - EDITED: Fixed Auth Timeout crash by degrading to guest mode smoothly.
 * - EDITED (2026-05-13): Hardened `tokenParsed` destructuring with an empty fallback object.
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
  // FIX: Align SSR loading state to avoid hydration mismatch (#418, #423, #425)
  const [loading, setLoading] = useState(typeof window !== 'undefined');
  const [keycloak, setKeycloak] = useState(null);
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

    console.log("[Auth] Init Started");

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
    
    if (!authUrl) {
      console.error("[Auth] FATAL: NEXT_PUBLIC_AUTH_URL is missing. Halting Keycloak init to enforce zero-trust.");
      setLoading(false);
      return;
    }

    const initKeycloak = new Keycloak({
      url: authUrl,
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    const url = window.location.href;
    const isLoginCallback = (window.location.search.includes("code=") || window.location.hash.includes("code=")) && url.includes("state=");
    const isLoginError = url.includes('error=login_required');
    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';

    let initOptions = {
      pkceMethod: 'S256',
      checkLoginIframe: false
    };

    if (isLoginError) {
      console.warn("[Auth] Silent SSO Failed. Disabling future checks.");
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
        
        setKeycloak(initKeycloak);

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
          let safeName = String(name || 'Anonymous User');

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
                  window.faro.api.setUser({ id: safeId, username: String(displayName || name || 'Anonymous User'), email: safeEmail });
                }
              } catch (e) {}
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

        // ANTI-LOOP CIRCUIT BREAKER
        if (window.location.search.includes('code=') || window.location.hash.includes('code=')) {
            console.error("[Auth] FATAL: Token exchange failed immediately after callback. Engaging Anti-Loop breaker.");
            sessionStorage.setItem('kc_fatal_loop_breaker', 'true');
            setFatalError(true); 
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // FIX: Catch-all handles standard Keycloak 'authentication_expired' objects AND timeouts/CSP blocks.
            console.warn("[Auth] Non-fatal init failure or session expired. Degrading to guest mode.", err);
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
        alert("Authentication is currently blocked due to a Network or CSP failure. Please clear your cache or contact the administrator.");
        return;
    }

    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Redirecting to Keycloak...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
    } else {
      console.warn("[Auth] Login aborted: Keycloak is not fully initialized yet.");
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Logging out...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      sessionStorage.removeItem('kc_fatal_loop_breaker');
      try {
          if (window.faro && window.faro.api) window.faro.api.resetUser();
      } catch (e) {}
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