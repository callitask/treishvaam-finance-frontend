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

    setKeycloak(initKeycloak);

    // --- INFINITE LOOP PROTECTION STRATEGY ---

    // 1. Check current URL for Keycloak error redirect
    const hash = window.location.hash;
    const isLoginRequiredError = hash && hash.includes('error=login_required');

    // 2. Check if we have previously failed silently in this session
    const hasPriorFailure = sessionStorage.getItem('kc_silent_sso_failed') === 'true';

    // Default Init Options
    let initOptions = {
      pkceMethod: 'S256',
      // Disable iframe session checking to prevent modern browser 3rd-party cookie blocking
      checkLoginIframe: false
    };

    // 3. Determine Load Strategy
    if (isLoginRequiredError) {
      console.warn("[Auth] Silent SSO Failed (Redirected with error). Disabling future checks for this session.");

      // Mark session as failed so we don't try again on reload
      sessionStorage.setItem('kc_silent_sso_failed', 'true');

      // Clean the URL hash so the user doesn't see the ugly error
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, null, cleanUrl);

      // CRITICAL: Do NOT set onLoad. The App will load in "Public/Unauthenticated" mode.

    } else if (hasPriorFailure) {
      console.log("[Auth] Skipping Silent SSO (Previous failure detected in session).");
      // Do NOT set onLoad. The App loads in "Public/Unauthenticated" mode immediately.

    } else {
      console.log("[Auth] Attempting Silent SSO...");
      // Only try check-sso if we haven't failed before
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
          // Success! Clear any failure flags.
          sessionStorage.removeItem('kc_silent_sso_failed');

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
          // Not authenticated (Public User)
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      })
      .catch((err) => {
        console.error("[Auth] Init Failed or Timed Out:", err);
        // If init fails technically, fallback to unauthenticated state
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
      console.log("[Auth] Triggering Manual Login...");
      // Clear the failure flag so the redirect back attempts a proper check
      sessionStorage.removeItem('kc_silent_sso_failed');
      keycloak.login().catch(err => console.error("Login failed:", err));
    } else {
      console.error("[Auth] Keycloak instance not ready. Reloading...");
      window.location.reload();
    }
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) {
      console.log("[Auth] Triggering Logout...");
      sessionStorage.removeItem('kc_silent_sso_failed'); // Clear flag
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
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [keycloak, isAuthenticated, logout]);

  return (
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token }, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};