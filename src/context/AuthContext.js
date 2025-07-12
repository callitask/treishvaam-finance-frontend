import React, { createContext, useState, useEffect, useContext } from 'react';
// MODIFIED: Changed import from '../services/api' to '../apiConfig'
import api from '../apiConfig'; // Use the consolidated API instance
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
        // Check for token expiry and required fields
        if (decoded.exp && decoded.exp * 1000 > Date.now() && decoded.sub) {
          setAuth({ token, user: { email: decoded.sub }, isAuthenticated: true });
        } else {
          localStorage.removeItem('token');
          setAuth({ token: null, user: null, isAuthenticated: false });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token');
        setAuth({ token: null, user: null, isAuthenticated: false });
      }
    } else {
      setAuth({ token: null, user: null, isAuthenticated: false });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      const decoded = jwtDecode(token);

      localStorage.setItem('token', token);
      setAuth({ token, user: { email: decoded.sub }, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      let message = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      setAuth({ token: null, user: null, isAuthenticated: false });
      return { success: false, message };
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
