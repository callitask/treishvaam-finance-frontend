import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken } from '../apiConfig';
import { Loader2 } from 'lucide-react';

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
    // If Keycloak redirects back with #error=login_required, it means silent SSO failed.
    // We must clear this from the URL to prevent Keycloak from seeing it and looping.
    if (window.location.hash && window.location.hash.includes('error=login_required')) {
      console.warn("[Auth] Detected login_required error loop. Clearing hash and forcing Public Mode.");
      // Removes the error hash from the URL without reloading the page
      window.history.replaceState(null, null, window.location.pathname);
    }

    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    // TIMEOUT STRATEGY: If Keycloak doesn't respond in 5s, we force the app to load.
    // This prevents the "White Screen of Death" if the backend is down or network is slow.
    const CONNECTION_TIMEOUT = 5000;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Timeout")), CONNECTION_TIMEOUT)
    );

    const initPromise = initKeycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false, // Critical for preventing 3rd party cookie blocks
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html' // Best practice for silent renewal
    });

    Promise.race([initPromise, timeoutPromise])
      .then((authenticated) => {
        console.log("[Auth] Init Success. Authenticated:", authenticated);
        setKeycloak(initKeycloak);

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
          // Not logged in, but initialization worked -> Public Mode
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((err) => {
        console.error("[Auth] Init Failed or Timed Out:", err);
        // CRITICAL FIX: If auth fails, do NOT reload. Just load the app in Public Mode.
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
      keycloak.login();
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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Securing Session...</p>
          <p className="text-xs text-gray-400 mt-2">Connecting to Identity Provider</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token }, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};