
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: null, user: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
            setAuth({ token, user: { email: decoded.sub }, isAuthenticated: true });
        } else {
            localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token } = response.data;
      const decoded = jwtDecode(token);

      localStorage.setItem('token', token);
      setAuth({ token, user: { email: decoded.sub }, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setAuth({ token: null, user: null, isAuthenticated: false });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
