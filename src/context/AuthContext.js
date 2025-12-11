import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
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

  useEffect(() => {
    const initKeycloak = new Keycloak({
      url: 'https://backend.treishvaamgroup.com/auth',
      realm: 'treishvaam',
      clientId: 'finance-app',
    });

    initKeycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
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

  // Wrap in useCallback to ensure stability across renders
  const login = useCallback(() => {
    if (keycloak) keycloak.login();
  }, [keycloak]);

  // Wrap in useCallback to satisfy useEffect dependency requirements
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
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [keycloak, isAuthenticated, logout]); // Added logout to dependency array

  return (
    <AuthContext.Provider value={{ auth: { user, isAuthenticated, token }, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};