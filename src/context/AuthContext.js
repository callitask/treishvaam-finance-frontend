import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken } from '../apiConfig';
import { Loader2 } from 'lucide-react'; // Import Loader icon

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

  // FIX: Ref to track if initialization has already happened (prevents React 18 double-call)
  const isRun = useRef(false);

  useEffect(() => {
    // FIX: Strict idempotency check to prevent race conditions with OIDC code exchange
    if (isRun.current) return;
    isRun.current = true;

    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    initKeycloak.init({
      onLoad: 'check-sso',
      // FIX: Removed silentCheckSsoRedirectUri to prevent "App-in-Iframe" recursion loop
      // if the static html file is missing.
      pkceMethod: 'S256',
      checkLoginIframe: false // Disable iframe check to prevent third-party cookie issues
    }).then((authenticated) => {
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
        setIsAuthenticated(false);
        setAuthToken(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Keycloak init failed", err);
      setLoading(false);
    });
  }, []);

  const login = useCallback(() => {
    if (keycloak) keycloak.login();
  }, [keycloak]);

  const logout = useCallback(() => {
    if (keycloak) keycloak.logout();
  }, [keycloak]);

  // Automatic Token Refresh
  useEffect(() => {
    if (!keycloak || !isAuthenticated) return;

    const intervalId = setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          setToken(keycloak.token);
          setAuthToken(keycloak.token);
        }
      }).catch(() => {
        console.error('Failed to refresh token');
        logout();
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [keycloak, isAuthenticated, logout]);

  // FIX: Render a loader instead of nothing (white screen)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Securing Session...</p>
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