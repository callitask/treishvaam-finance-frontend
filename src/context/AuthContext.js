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

    // --- CIRCUIT BREAKER: FIX INFINITE LOGIN LOOP ---
    if (window.location.hash && window.location.hash.includes('error=login_required')) {
      console.warn("[Auth] Detected login_required error loop. Clearing hash and forcing Public Mode.");
      window.history.replaceState(null, null, window.location.pathname);
    }

    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    // 1. Set instance IMMEDIATELY so login() works even if init is slow/fails
    setKeycloak(initKeycloak);

    const CONNECTION_TIMEOUT = 5000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    const initPromise = initKeycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: true,
      checkLoginIframeInterval: 20,
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    });

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
        // Fallback to unauthenticated state on error
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

  // NON-BLOCKING RETURN: Always render children, expose loading state
  return (
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token }, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};