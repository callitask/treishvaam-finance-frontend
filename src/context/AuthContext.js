import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken } from '../apiConfig';
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
    if (isRun.current) return;
    isRun.current = true;

    // --- ENTERPRISE FIX: DETECT BOTS & SKIP AUTH ---
    // We explicitly check for:
    // 1. Standard Bot UserAgents (Googlebot, Bing, etc.)
    // 2. Headless Browsers (Lighthouse, Inspection Tool uses navigator.webdriver)
    // 3. Inspection Tool specific keywords in UA
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
      return; // STOP HERE. Do not init Keycloak.
    }

    console.log("[Auth] Init Started");

    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    setKeycloak(initKeycloak);

    // --- AUTHENTICATION STRATEGY ---

    // 1. Analyze URL for specific states
    const url = window.location.href;
    const hash = window.location.hash;
    const isLoginCallback = url.includes("code=") && url.includes("state=");
    const isLoginError = hash && hash.includes('error=login_required');

    // 2. Check Session History
    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';

    // Default Init Options
    let initOptions = {
      pkceMethod: 'S256',
      checkLoginIframe: false // Disable iframe to prevent 3rd-party cookie blocking
    };

    // 3. Determine Strategy
    if (isLoginError) {
      console.warn("[Auth] Silent SSO Failed. Disabling future checks.");
      sessionStorage.setItem('kc_silent_sso_failed', 'true');

      // Clean URL to remove error hash
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, null, cleanUrl);

      // Load as Public (No onLoad)

    } else if (isLoginCallback) {
      console.log("[Auth] Processing Login Callback (Code Exchange)...");
      // CRITICAL: We MUST proceed with init() to exchange the code.
      // We do NOT set onLoad='check-sso' because the code is already present.
      // We implicitly clear the failure flag because this is an explicit action.
      sessionStorage.removeItem('kc_silent_sso_failed');

    } else if (hasPriorFailure) {
      console.log("[Auth] Skipping Silent SSO (Previous failure detected).");
      // Load as Public (No onLoad)

    } else {
      console.log("[Auth] Attempting Silent SSO...");
      initOptions.onLoad = 'check-sso';
      initOptions.silentCheckSsoRedirectUri = window.location.origin + '/silent-check-sso.html';
    }

    // --- INITIALIZATION ---

    const CONNECTION_TIMEOUT = 10000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    // Pass initOptions explicitly
    const initPromise = initKeycloak.init(initOptions);

    Promise.race([initPromise, timeoutPromise])
      .then((authenticated) => {
        console.log("[Auth] Init Success. Authenticated:", authenticated);

        if (authenticated) {
          // Explicitly clear failure flags on success
          sessionStorage.removeItem('kc_silent_sso_failed');

          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);

          const { name, email, realm_access } = initKeycloak.tokenParsed;
          const roles = realm_access ? realm_access.roles : [];

          // --- OBSERVABILITY HOOK ---
          // Link the anonymous Faro session to this authenticated user
          if (faro) {
            faro.api.setUser({
              id: email, // Use email as unique stable ID
              username: name,
              email: email
            });
            console.log("[Faro] User context linked:", email);
          }

          setUser({
            name,
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          });
        } else {
          setIsAuthenticated(false);
          setAuthToken(null);
          // Optional: Reset Faro user if needed, but usually session persists
        }
      })
      .catch((err) => {
        console.error("[Auth] Init Failed:", err);
        setIsAuthenticated(false);
        setAuthToken(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const login = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Redirecting to Keycloak...");
      // Clear failure flag to allow fresh attempt
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Logging out...");
      sessionStorage.removeItem('kc_silent_sso_failed');

      // Clear Faro User Context on Logout
      if (faro) {
        faro.api.resetUser();
      }

      keycloak.logout();
    }
  }, [keycloak]);

  // Token Refresh Logic
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
        console.error('[Auth] Token Refresh Failed');
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