import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken, getUserProfile } from '../apiConfig'; // PHASE 2: Added getUserProfile
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

    // --- CONFIGURATION ---
    const authUrl = process.env.REACT_APP_AUTH_URL || 'https://backend.treishvaamgroup.com/auth';

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
      checkLoginIframe: false // Disable iframe to prevent 3rd-party cookie blocking
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
      console.log("[Auth] Skipping Silent SSO (Previous failure detected).");

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

          // 1. Set Initial User State (Fast)
          const initialUser = {
            name, // Fallback to Token Name
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          };
          setUser(initialUser);

          // 2. PHASE 2: Fetch Rich Profile (Display Name) from Backend
          getUserProfile().then(response => {
            if (response.data) {
              const { displayName } = response.data;
              console.log("[Auth] Enriched Profile:", displayName);

              setUser(prev => ({
                ...prev,
                name: displayName || prev.name, // Override name with Display Name
                displayName: displayName
              }));

              // Update Faro Context with Correct Name
              if (faro) {
                faro.api.setUser({
                  id: email,
                  username: displayName || name,
                  email: email
                });
              }
            }
          }).catch(err => {
            console.warn("[Auth] Failed to fetch extended profile", err);
          });

          // Fallback Faro (if profile fetch fails/delays)
          if (faro) {
            faro.api.setUser({ id: email, username: name, email: email });
          }

        } else {
          setIsAuthenticated(false);
          setAuthToken(null);
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
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Logging out...");
      sessionStorage.removeItem('kc_silent_sso_failed');
      if (faro) faro.api.resetUser();
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