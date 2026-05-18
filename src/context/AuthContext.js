"use client";
/**
 * AI-CONTEXT:
 * Purpose: Provides Keycloak-based authentication state.
 * IMMUTABLE CHANGE HISTORY (DO NOT DELETE):
 * - EDITED: Extended CONNECTION_TIMEOUT to 30000ms to prevent token-exchange timeouts on Cloudflare tunnel cold starts.
 * - EDITED: Improved callback detection to safely handle both search (?) and hash (#) PKCE payloads.
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

    if (isHeadless || botKeywords.some(keyword => userAgent.includes(keyword))) {
      console.log("[Auth] Bot/Crawler detected. Skipping Keycloak init.");
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

    setKeycloak(initKeycloak);

    const url = window.location.href;
    // Safely check both standard query params and fragments for the callback code
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
      console.log("[Auth] Skipping Silent SSO. Guest mode active.");
    } else {
      console.log("[Auth] Attempting Silent SSO...");
      initOptions.onLoad = 'check-sso';
      initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
    }

    // CRITICAL FIX: Increased timeout from 10s to 30s for cold-start token exchange via Tunnels
    const CONNECTION_TIMEOUT = 30000; 

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

          // Scrub URL to remove code/state parameters
          if (window.location.search.includes('code=') || window.location.hash.includes('code=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
          }

          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);

          const { name, email, realm_access, sub } = initKeycloak.tokenParsed || {};
          const roles = realm_access ? realm_access.roles : [];

          setUser({
            name,
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          });

          const safeId = String(sub || email || 'anonymous-id');
          const safeEmail = String(email || 'anonymous@treishvaam.com');
          
          try {
            if (window.faro && window.faro.api) {
              window.faro.api.setUser({ id: safeId, username: String(name || 'Anonymous User'), email: safeEmail });
            }
          } catch (e) {
            console.warn("[Auth] Initial Faro instrumentation failed");
          }

          getUserProfile().then(response => {
            if (response?.data) {
              setUser(prev => ({ ...prev, name: response.data.displayName || prev.name, displayName: response.data.displayName }));
            }
          }).catch(err => console.warn("[Auth] Failed to fetch extended profile:", err));

        } else {
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((rawErr) => {
        const err = rawErr === undefined ? "CSP_BLOCK_OR_UNDEFINED" : rawErr;
        const errMsg = err instanceof Error ? err.message : String(err);
        
        console.error("[Auth] Init Failed:", err);

        // If we fail specifically during a callback, trip the loop breaker
        if (window.location.search.includes('code=') || window.location.hash.includes('code=')) {
            console.error("[Auth] FATAL: Token exchange failed. Engaging Anti-Loop breaker.");
            sessionStorage.setItem('kc_fatal_loop_breaker', 'true');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (errMsg === "Auth Timeout" || errMsg === "CSP_BLOCK_OR_UNDEFINED") {
            console.warn("[Auth] Init Blocked/Timeout (Check CSP). Degrading to guest mode.");
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
        alert("Authentication is temporarily blocked due to a network timeout. Please refresh the page and try again.");
        sessionStorage.removeItem('kc_fatal_loop_breaker');
        return;
    }

    if (keycloak && typeof window !== 'undefined') {
      console.log("[Auth] Redirecting to Keycloak...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login({ redirectUri: window.location.origin + '/dashboard' });
    } else {
      console.warn("[Auth] Keycloak is not yet initialized. Please wait a moment.");
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