/**
 * AI-CONTEXT:
 * Purpose: Central Axios configuration and API method declarations.
 * Scope: Responsible for routing all frontend requests securely to the API proxy.
 * IMMUTABLE CHANGE HISTORY:
 * - EDITED: Added getMarketData and getQuoteData to fix Next.js import crash.
 * - EDITED: Exported refreshGA4Data POST endpoint for Audience Dashboard manual syncing.
 * - EDITED: Migrated process.env.REACT_APP_ to process.env.NEXT_PUBLIC_ for Next.js compatibility.
 */
import axios from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend.treishvaamgroup.com';
export const API_URL = BASE_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

let currentToken = null;

export const setAuthToken = (token) => {
  currentToken = token;
};

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
export const login = () => Promise.reject("Use Keycloak Login");
export const getUserProfile = () => api.get('/auth/me');
export const updateUserProfile = (data) => api.put('/auth/profile', data);

/* -------------------- Search -------------------- */
export const searchPosts = (query) => api.get(`/search?q=${encodeURIComponent(query)}`);

/* -------------------- News -------------------- */
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

// AI-CONTEXT: Missing endpoints added to fix Next.js build
export const getMarketData = (ticker) => api.get(`/market/data/${encodeURIComponent(ticker)}`);
export const getQuoteData = (ticker) => api.get(`/market/quote/${encodeURIComponent(ticker)}`);

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
    if (params[key] && params[key].length > 0) cleanParams[key] = params[key];
  }
  return api.get(`/analytics`, { params: cleanParams });
};

export const getFilterOptions = (params) => {
  const cleanParams = {};
  for (const key in params) {
    if (params[key] && params[key].length > 0) cleanParams[key] = params[key];
  }
  return api.get(`/analytics/filters`, { params: cleanParams });
};

export const refreshGA4Data = (startDate, endDate) => api.post('/analytics/refresh', { startDate, endDate });

export default api;