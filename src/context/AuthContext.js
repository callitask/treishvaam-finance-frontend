import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken } from '../apiConfig';

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

    console.log("[Auth] Init Started");

    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    // Set instance IMMEDIATELY so login() works even if init is slow/fails
    setKeycloak(initKeycloak);

    // --- CRITICAL LOOP FIX START ---

    // Default options
    let initOptions = {
      pkceMethod: 'S256',
      // Disable iframe to prevent 3rd-party cookie blocking issues
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    };

    // Check if we are returning from a failed Check-SSO attempt
    if (window.location.hash && window.location.hash.includes('error=login_required')) {
      console.warn("[Auth] Login Loop Detected (error=login_required).");
      console.warn("[Auth] Disabling 'check-sso' for this session to prevent redirect loop.");

      // 1. CLEAN THE URL: Remove the error hash so the user sees a clean URL
      window.history.replaceState(null, null, window.location.pathname);

      // 2. DISABLE CHECK-SSO: Do NOT set onLoad. 
      // This allows the app to init in "Public/Unauthenticated" mode immediately without redirecting.
      delete initOptions.onLoad;

    } else {
      // Normal Load: Try to check if user is logged in
      initOptions.onLoad = 'check-sso';
    }

    // --- CRITICAL LOOP FIX END ---

    const CONNECTION_TIMEOUT = 10000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    const initPromise = initKeycloak.init(initOptions);

    Promise.race([initPromise, timeoutPromise])
      .then((authenticated) => {
        console.log("[Auth] Init Success. Authenticated:", authenticated);

        if (authenticated) {
          setToken(initKeycloak.token);
          setAuthToken(initKeycloak.token);
          setIsAuthenticated(true);

          const { name, email, realm_access } = initKeycloak.tokenParsed;
          const roles = realm_access ? realm_access.roles : [];

          setUser({
            name,
            email,
            roles,
            isAdmin: roles.includes('admin') || roles.includes('publisher')
          });
        } else {
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((err) => {
        console.error("[Auth] Init Failed or Timed Out:", err);
        setIsAuthenticated(false);
        setAuthToken(null);
      })
      .finally(() => {
        setLoading(false);
        console.log("[Auth] Loading State Cleared");
      });

  }, []);

  const login = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Triggering Login...");
      keycloak.login().catch(err => console.error("Login failed:", err));
    } else {
      console.error("[Auth] Keycloak instance not ready. Reloading...");
      window.location.reload();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Triggering Logout...");
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
        console.error('[Auth] Failed to refresh token');
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