// src/apiConfig.js
import axios from 'axios';

/**
 * Backend Base URL Configuration
 * ------------------------------
 * Best Practice: Use Environment Variables.
 * * Local Dev: Read from .env (http://localhost:8080)
 * * Production: Read from Cloudflare Environment Variables (https://backend.treishvaamgroup.com)
 */
export const BASE_URL = process.env.REACT_APP_API_URL || 'https://backend.treishvaamgroup.com';

// Keep API_URL for backward compatibility with other components
export const API_URL = BASE_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Holds the current token, set by AuthContext
let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

// Attach JWT from Keycloak
api.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers['Authorization'] = 'Bearer ' + currentToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* -------------------- Blog / Posts -------------------- */
export const getPaginatedPosts = (page = 0, size = 9) => api.get(`/posts?page=${page}&size=${size}`);
export const getAllPostsForAdmin = () => api.get('/posts/admin/all');
export const getPost = (id) => api.get(`/posts/${id}`);
export const getPostByUrlId = (urlArticleId) => api.get(`/posts/url/${urlArticleId}`);
export const createPost = (formData) => api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePost = (id, formData) => api.put(`/posts/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const duplicatePost = (id) => api.post(`/posts/${id}/duplicate`);
export const bulkDeletePosts = (ids) => api.delete('/posts/bulk', { data: ids });
export const createDraft = (postData) => api.post('/posts/draft', postData);
export const updateDraft = (id, postData) => api.put(`/posts/draft/${id}`, postData);
export const getDrafts = () => api.get('/posts/admin/drafts');

/* -------------------- Files & Categories -------------------- */
export const uploadFile = (formData) => api.post('/files/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getCategories = () => api.get('/categories');
export const addCategory = (data) => api.post('/categories', data);

/* -------------------- Auth & Profile -------------------- */
// Deprecated: Login is handled by Keycloak redirect
export const login = () => Promise.reject("Use Keycloak Login");
// PHASE 2: New Profile Endpoints
export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/profile', data);


/* -------------------- Search -------------------- */
export const searchPosts = (query) => api.get(`/search?q=${encodeURIComponent(query)}`);

/* -------------------- News (FIXED ENDPOINTS) -------------------- */
export const getNewsHighlights = () => api.get('/market/news/highlights');
export const getArchivedNews = () => api.get('/market/news/archive');
export const refreshNewsData = () => api.post('/news/admin/refresh');

/* -------------------- Market / Movers -------------------- */
export const getTopGainers = () => api.get('/market/top-gainers');
export const getTopLosers = () => api.get('/market/top-losers');
export const getMostActive = () => api.get('/market/most-active');
export const refreshMovers = () => api.post('/market/admin/refresh-movers');
export const refreshIndices = () => api.post('/market/admin/refresh-indices');
export const flushMovers = (password) => api.post('/market/admin/flush-movers', { password });
export const flushIndices = (password) => api.post('/market/admin/flush-indices', { password });

/* -------------------- Market Widgets -------------------- */
export const getWidgetData = (ticker) => api.get(`/market/widget?ticker=${encodeURIComponent(ticker)}`);
export const getQuotesBatch = (tickers) => api.post('/market/quotes/batch', tickers);

/* -------------------- API Status Panel -------------------- */
export const getApiStatusHistory = () => api.get('/status/history');
export const flushPermanentData = (password) => api.post('/market/admin/flush-permanent-data', { password });

/* -------------------- Analytics -------------------- */
export const getHistoricalAudienceData = (params) => {
  const cleanParams = {};
  for (const key in params) {
    if (params[key]) cleanParams[key] = params[key];
  }
  return api.get(`/analytics`, { params: cleanParams });
};

export const getFilterOptions = (params) => {
  const cleanParams = {};
  for (const key in params) {
    if (params[key]) cleanParams[key] = params[key];
  }
  return api.get(`/analytics/filters`, { params: cleanParams });
};

export default api;